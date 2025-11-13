import React from 'react';
import { ImageIcon, DollarSign, Users, Plus, Download, FileArchive, Eye } from 'lucide-react';
import type { Artwork, Client } from '../lib/supabase';

const fmtMoney = (n: number | string | undefined) =>
  `$${(parseFloat(String(n || 0))).toLocaleString()}`;

type DashboardProps = {
  artworks: Artwork[];
  clients: Client[];
  isAdmin: boolean;
  onAddArtwork: () => void;
  onAddClient: () => void;
  onExportExcel: () => void;
  onExportZip: () => void;
  onExportCSV: () => void;
  onViewClient?: (client: Client) => void;
};

export const Dashboard: React.FC<DashboardProps> = ({
  artworks,
  clients,
  isAdmin,
  onAddArtwork,
  onAddClient,
  onExportExcel,
  onExportZip,
  onExportCSV,
  onViewClient,
}) => {
  const numCollections = new Set(artworks.map(a => a.client_id).filter(Boolean)).size;

  const stats = [
    { label: 'Total Artworks', value: artworks.length, icon: ImageIcon },
    {
      label: 'Number of Collections',
      value: numCollections,
      icon: DollarSign
    },
    { label: 'Active Clients', value: clients.length, icon: Users }
  ];

  const clientsWithArtworks = clients.map(client => ({
    ...client,
    artworkCount: artworks.filter(a => a.client_id === client.id).length,
    totalValue: artworks
      .filter(a => a.client_id === client.id)
      .reduce((sum, a) => sum + (parseFloat(String(a.price || 0))), 0)
  })).sort((a, b) => b.artworkCount - a.artworkCount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <stat.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Clients</h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {clientsWithArtworks.slice(0, 8).map(client => (
                <button
                  key={client.id}
                  onClick={() => onViewClient?.(client)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition group border border-transparent hover:border-gray-200"
                >
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {client.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {client.artworkCount} artwork{client.artworkCount !== 1 ? 's' : ''} · {fmtMoney(client.totalValue)}
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Artworks</h3>
          {artworks.slice(0, 5).map(art => (
            <div key={art.id} className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <div className="font-semibold text-gray-900">{art.title}</div>
                <div className="text-sm text-gray-600">{art.artist}</div>
              </div>
              <div className="font-semibold text-gray-900">{fmtMoney(art.price)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={onAddArtwork}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-600">Add Artwork</span>
            </button>

            {isAdmin && (
              <button
                onClick={onAddClient}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <Plus className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Add Client</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportExcel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Download className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Excel</span>
              </button>
              <button
                onClick={onExportZip}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
              >
                <FileArchive className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-600">ZIP</span>
              </button>
            </div>

            <button
              onClick={onExportCSV}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <Download className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-700">CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
