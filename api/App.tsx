import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import type { Artwork, Client } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Modal } from './components/Modal';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Clients } from './components/Clients';
import { ClientCollection } from './components/ClientCollection';
import { Gallery } from './components/Gallery';
import { Reports } from './components/Reports';
import { ArtworkForm } from './components/ArtworkForm';
import { ClientForm } from './components/ClientForm';
import { ClientBenefits } from './components/ClientBenefits';
import { generateFactSheetPDF, exportExcel, exportFactSheetsZip, exportCSV } from './utils/export';
import { bulkImport, type BulkArtwork } from './utils/bulkImport';
import { saveAs } from 'file-saver';

function App() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [view, setView] = useState('dashboard');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'artwork' | 'client'>('artwork');
  const [editItem, setEditItem] = useState<Artwork | Client | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [bulkSheet, setBulkSheet] = useState<File | null>(null);
  const [bulkZip, setBulkZip] = useState<File | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    try {
      if (isAdmin) {
        const [artworksRes, clientsRes] = await Promise.all([
          supabase.from('artworks').select('*').order('created_at', { ascending: false }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
        ]);

        if (artworksRes.error) throw artworksRes.error;
        if (clientsRes.error) throw clientsRes.error;

        setArtworks(artworksRes.data || []);
        setClients(clientsRes.data || []);
      } else {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (clientError) throw clientError;

        if (clientData) {
          setSelectedClient(clientData);
          setClients([clientData]);

          const { data: artworksData, error: artworksError } = await supabase
            .from('artworks')
            .select('*')
            .eq('client_id', clientData.id)
            .order('created_at', { ascending: false });

          if (artworksError) throw artworksError;
          setArtworks(artworksData || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert('Failed to load data: ' + error.message);
    }
  };

  const handleAddArtwork = async (artwork: Partial<Artwork>): Promise<string | null> => {
    try {
      if (editItem && 'artist' in editItem) {
        const { error } = await supabase
          .from('artworks')
          .update({ ...artwork, updated_at: new Date().toISOString() })
          .eq('id', editItem.id);

        if (error) throw error;
        await loadData();
        setShowModal(false);
        setEditItem(null);
        return editItem.id;
      } else {
        const { data, error } = await supabase
          .from('artworks')
          .insert([artwork])
          .select()
          .single();

        if (error) throw error;
        await loadData();
        setShowModal(false);
        setEditItem(null);
        return data?.id || null;
      }
    } catch (error: any) {
      console.error('Error saving artwork:', error);
      alert('Failed to save artwork: ' + error.message);
      return null;
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('Error deleting artwork:', error);
      alert('Failed to delete artwork: ' + error.message);
    }
  };

  const handleAddClient = async (client: Partial<Client>, createAccount: boolean = false, password?: string) => {
    try {
      if (editItem && 'email' in editItem && !('artist' in editItem)) {
        const oldClient = editItem as Client;
        const emailChanged = oldClient.email !== client.email;

        const { error } = await supabase
          .from('clients')
          .update({ ...client, updated_at: new Date().toISOString() })
          .eq('id', editItem.id);

        if (error) throw error;

        if (emailChanged && oldClient.user_id) {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;

          if (token) {
            try {
              const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-client-email`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: oldClient.user_id,
                    newEmail: client.email,
                  }),
                }
              );

              const result = await response.json();

              if (!response.ok) {
                console.error('Failed to update user email:', result.error);
                alert(`Client information updated, but failed to update login email: ${result.error}\nThe client can still log in with their old email: ${oldClient.email}`);
              } else {
                alert('Client information and login email updated successfully!');
              }
            } catch (emailError: any) {
              console.error('Error updating user email:', emailError);
              alert(`Client information updated, but failed to update login email.\nThe client can still log in with their old email: ${oldClient.email}`);
            }
          }
        }

        await loadData();
      } else {
        const { data: insertedClient, error } = await supabase
          .from('clients')
          .insert([client])
          .select()
          .single();

        if (error) throw error;

        if (createAccount && password && insertedClient) {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;

          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-client-account`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: client.email,
                password: password,
                clientId: insertedClient.id,
              }),
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to create account');
          }

          alert(`Client account created successfully! They can now log in with:\nEmail: ${client.email}\nPassword: (the one you set)`);
        }

        await loadData();
      }

      setShowModal(false);
      setEditItem(null);
    } catch (error: any) {
      console.error('Error saving client:', error);
      alert('Failed to save client: ' + error.message);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client: ' + error.message);
    }
  };

  const handleDownloadPDF = async (art: Artwork) => {
    try {
      const blob = await generateFactSheetPDF(art);
      const safe = (s?: string) => String(s || '').replace(/[^A-Za-z0-9._-]+/g, '_');
      saveAs(blob, `FactSheet_${safe(art.artist)}_${safe(art.title)}_${art.id}.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  const handleBulkImport = async () => {
    try {
      setBulkBusy(true);

      const res = await bulkImport(bulkSheet, bulkZip, async (art: BulkArtwork) => {
        let clientId = art.client_id;

        if (clientId && !clientId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('email', clientId)
            .maybeSingle();

          if (existingClient) {
            clientId = existingClient.id;
          } else {
            const { data: newClient, error } = await supabase
              .from('clients')
              .insert([{ name: clientId.split('@')[0], email: clientId, type: 'Collector' }])
              .select()
              .single();

            if (error) throw error;
            clientId = newClient.id;
          }
        }

        const { error } = await supabase.from('artworks').insert([
          {
            ...art,
            client_id: clientId,
          },
        ]);

        if (error) throw error;
      });

      alert(
        `Imported ${res.created} artworks${res.errors.length ? `, ${res.errors.length} errors (downloaded CSV)` : ''}`
      );

      if (res.errors.length) {
        const headers = 'row,error\n';
        const lines = res.errors.map((e) => `${e.row},"${(e.error || '').replace(/"/g, '""')}"`).join('\n');
        const blob = new Blob([headers + lines], { type: 'text/csv' });
        saveAs(blob, 'bulk_errors.csv');
      }

      setBulkSheet(null);
      setBulkZip(null);
      await loadData();
    } catch (e: any) {
      alert(`Bulk import failed: ${e.message}`);
    } finally {
      setBulkBusy(false);
    }
  };

  const filteredArtworks = artworks.filter(
    (a) =>
      !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.artist?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        view={view}
        setView={setView}
        user={user}
        onSignOut={signOut}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        isAdmin={isAdmin}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {view === 'dashboard' && !selectedClient && (
            <>
              {!isAdmin && <ClientBenefits />}
              <Dashboard
                artworks={artworks}
                clients={clients}
                isAdmin={isAdmin}
                onAddArtwork={() => {
                  setModalType('artwork');
                  setEditItem(null);
                  setShowModal(true);
                }}
                onAddClient={() => {
                  setModalType('client');
                  setEditItem(null);
                  setShowModal(true);
                }}
                onExportExcel={() => exportExcel(filteredArtworks)}
                onExportZip={() => exportFactSheetsZip(filteredArtworks, user.email?.split('@')[0])}
                onExportCSV={() => exportCSV(artworks, 'inventory')}
                onViewClient={(client) => {
                  setSelectedClient(client);
                  setSearch('');
                }}
              />
            </>
          )}

          {view === 'dashboard' && selectedClient && (
            <ClientCollection
              client={selectedClient}
              artworks={artworks}
              search={search}
              setSearch={setSearch}
              onBack={() => {
                setSelectedClient(null);
                setSearch('');
              }}
              onAdd={() => {
                setModalType('artwork');
                setEditItem(null);
                setShowModal(true);
              }}
              onEdit={(artwork) => {
                setEditItem(artwork);
                setModalType('artwork');
                setShowModal(true);
              }}
              onDelete={handleDeleteArtwork}
              onDownloadPDF={handleDownloadPDF}
              onExportAll={() => {
                const clientArtworks = artworks.filter(a => a.client_id === selectedClient.id);
                exportFactSheetsZip(clientArtworks, selectedClient.name || selectedClient.email?.split('@')[0] || 'Client');
              }}
            />
          )}

          {view === 'inventory' && (
            <Inventory
              artworks={filteredArtworks}
              search={search}
              setSearch={setSearch}
              onAdd={() => {
                setModalType('artwork');
                setEditItem(null);
                setShowModal(true);
              }}
              onEdit={(artwork) => {
                setEditItem(artwork);
                setModalType('artwork');
                setShowModal(true);
              }}
              onDelete={handleDeleteArtwork}
              onDownloadPDF={handleDownloadPDF}
            />
          )}

          {view === 'clients' && isAdmin && !selectedClient && (
            <Clients
              clients={clients}
              search={search}
              setSearch={setSearch}
              onAdd={() => {
                setModalType('client');
                setEditItem(null);
                setShowModal(true);
              }}
              onEdit={(client) => {
                setEditItem(client);
                setModalType('client');
                setShowModal(true);
              }}
              onDelete={handleDeleteClient}
              onViewCollection={(client) => {
                setSelectedClient(client);
                setSearch('');
              }}
            />
          )}

          {view === 'clients' && isAdmin && selectedClient && (
            <ClientCollection
              client={selectedClient}
              artworks={artworks}
              search={search}
              setSearch={setSearch}
              onBack={() => {
                setSelectedClient(null);
                setSearch('');
              }}
              onAdd={() => {
                setModalType('artwork');
                setEditItem(null);
                setShowModal(true);
              }}
              onEdit={(artwork) => {
                setEditItem(artwork);
                setModalType('artwork');
                setShowModal(true);
              }}
              onDelete={handleDeleteArtwork}
              onDownloadPDF={handleDownloadPDF}
              onExportAll={() => {
                const clientArtworks = artworks.filter(a => a.client_id === selectedClient.id);
                exportFactSheetsZip(clientArtworks, selectedClient.name || selectedClient.email?.split('@')[0] || 'Client');
              }}
            />
          )}

          {view === 'gallery' && (
            <Gallery
              artworks={filteredArtworks}
              search={search}
              setSearch={setSearch}
              onViewDetails={(artwork) => {
                setEditItem(artwork);
                setModalType('artwork');
                setShowModal(true);
              }}
            />
          )}

          {view === 'reports' && (
            <Reports
              onExportExcel={() => exportExcel(filteredArtworks)}
              onExportCSV={() => exportCSV(artworks, 'inventory')}
              onExportZip={() => exportFactSheetsZip(filteredArtworks, user.email?.split('@')[0])}
              onBulkImport={handleBulkImport}
              setBulkSheet={setBulkSheet}
              setBulkZip={setBulkZip}
              bulkBusy={bulkBusy}
              bulkSheetSelected={!!bulkSheet}
            />
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={(editItem ? 'Edit ' : 'Add ') + (modalType === 'artwork' ? 'Artwork' : 'Client')}
          onClose={() => {
            setShowModal(false);
            setEditItem(null);
          }}
        >
          {modalType === 'artwork' ? (
            <ArtworkForm
              item={editItem && 'artist' in editItem ? (editItem as Artwork) : null}
              clients={clients}
              defaultClientId={selectedClient?.id}
              onSave={handleAddArtwork}
              onClose={() => {
                setShowModal(false);
                setEditItem(null);
              }}
            />
          ) : (
            <ClientForm
              item={editItem && 'email' in editItem && !('artist' in editItem) ? (editItem as Client) : null}
              onSave={handleAddClient}
              onClose={() => {
                setShowModal(false);
                setEditItem(null);
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

export default App;
