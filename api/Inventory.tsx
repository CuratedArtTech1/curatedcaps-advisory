import React, { useState } from 'react';
import { Search, Plus, ImageIcon, Edit2, Trash2, FileText, Paperclip } from 'lucide-react';
import type { Artwork } from '../lib/supabase';
import { ArtworkDocuments } from './ArtworkDocuments';

const fmtMoney = (n: number | string | undefined) =>
  `$${(parseFloat(String(n || 0))).toLocaleString()}`;

type InventoryProps = {
  artworks: Artwork[];
  search: string;
  setSearch: (search: string) => void;
  onAdd: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
  onDownloadPDF: (artwork: Artwork) => void;
};

export const Inventory: React.FC<InventoryProps> = ({
  artworks,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  onDownloadPDF,
}) => {
  const [viewDocuments, setViewDocuments] = useState<Artwork | null>(null);

  return (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search artworks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Plus className="w-5 h-5" />
        Add
      </button>
    </div>

    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {artworks.map(art => (
            <tr key={art.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                {(art.image_data_url || art.image_data) ? (
                  <img src={art.image_data_url || art.image_data} alt="" className="w-14 h-14 object-cover rounded-md border" />
                ) : (
                  <div className="w-14 h-14 rounded-md border bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{art.title}</td>
              <td className="px-6 py-4 text-gray-600">{art.artist}</td>
              <td className="px-6 py-4 text-gray-600">{art.year}</td>
              <td className="px-6 py-4 font-semibold text-gray-900">{fmtMoney(art.price)}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {art.condition}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewDocuments(art)}
                    className="text-green-600 hover:text-green-800"
                    title="View Documents"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDownloadPDF(art)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Fact Sheet PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(art)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this artwork?')) {
                        onDelete(art.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {viewDocuments && (
      <ArtworkDocuments
        artworkId={viewDocuments.id}
        artworkTitle={`${viewDocuments.artist} - ${viewDocuments.title}`}
        onClose={() => setViewDocuments(null)}
      />
    )}
  </div>
  );
};
