import React from 'react';
import { Search, Image as ImageIcon } from 'lucide-react';
import type { Artwork } from '../lib/supabase';

const fmtMoney = (n: number | string | undefined) =>
  `$${(parseFloat(String(n || 0))).toLocaleString()}`;

type GalleryProps = {
  artworks: Artwork[];
  search: string;
  setSearch: (search: string) => void;
  onViewDetails?: (artwork: Artwork) => void;
};

export const Gallery: React.FC<GalleryProps> = ({ artworks, search, setSearch, onViewDetails }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Online Gallery</h2>
      <div className="relative flex-1 max-w-md ml-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search gallery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map(art => (
        <div key={art.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            {(art.image_data_url || art.image_data) ? (
              <img src={art.image_data_url || art.image_data} alt="" className="h-48 w-full object-cover" />
            ) : (
              <ImageIcon className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{art.title}</h3>
            <p className="text-gray-600 mb-1">{art.artist}</p>
            <p className="text-sm text-gray-500 mb-3">
              {art.year} • {art.medium}
            </p>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-2xl font-bold text-blue-600">{fmtMoney(art.price)}</span>
              <button
                onClick={() => onViewDetails?.(art)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
