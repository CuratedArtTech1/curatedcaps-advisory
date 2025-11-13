import React from 'react';
import { ArrowLeft, Search, Plus, Download, FileDown } from 'lucide-react';
import type { Artwork, Client } from '../lib/supabase';
import { Inventory } from './Inventory';

type ClientCollectionProps = {
  client: Client;
  artworks: Artwork[];
  search: string;
  setSearch: (search: string) => void;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onDownloadPDF: (artwork: Artwork) => void;
  onExportAll: () => void;
};

export const ClientCollection: React.FC<ClientCollectionProps> = ({
  client,
  artworks,
  search,
  setSearch,
  onBack,
  onAdd,
  onEdit,
  onDelete,
  onDownloadPDF,
  onExportAll,
}) => {
  const clientArtworks = artworks.filter(a => a.client_id === client.id);
  const filtered = clientArtworks.filter(
    (a) =>
      !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.artist?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = clientArtworks.reduce((sum, a) => sum + (parseFloat(String(a.price || 0))), 0);
  const insuranceValue = clientArtworks.reduce((sum, a) => sum + (parseFloat(String(a.insurance_value || 0))), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Clients
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}'s Collection</h1>
            <div className="space-y-1 text-sm text-gray-600">
              <div>{client.email}</div>
              {client.phone && <div>{client.phone}</div>}
              <span className="inline-block mt-2 text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {client.type}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Total Artworks</div>
                <div className="text-2xl font-bold text-gray-900">{clientArtworks.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Collection Value</div>
                <div className="text-xl font-semibold text-green-600">
                  ${totalValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Insurance Value</div>
                <div className="text-lg font-semibold text-blue-600">
                  ${insuranceValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {clientArtworks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={onExportAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FileDown className="w-5 h-5" />
              Export All Fact Sheets
            </button>
          </div>
        )}
      </div>

      <Inventory
        artworks={filtered}
        search={search}
        setSearch={setSearch}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownloadPDF={onDownloadPDF}
      />
    </div>
  );
};
