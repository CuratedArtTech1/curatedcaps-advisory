import React from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import type { Client } from '../lib/supabase';

type ClientsProps = {
  clients: Client[];
  search: string;
  setSearch: (search: string) => void;
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewCollection: (client: Client) => void;
};

export const Clients: React.FC<ClientsProps> = ({
  clients,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  onViewCollection,
}) => {
  const filtered = clients.filter(
    c =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div key={client.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {client.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewCollection(client)}
                  className="text-green-600 hover:text-green-700"
                  title="View Collection"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(client)} className="text-blue-600 hover:text-blue-700" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this client?')) {
                      onDelete(client.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>{client.email}</div>
              {client.phone && <div>{client.phone}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
