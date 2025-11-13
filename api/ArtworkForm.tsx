import React, { useState, useEffect } from 'react';
import { ImageIcon, Upload, X, FileText } from 'lucide-react';
import type { Artwork, Client, ArtworkDocument } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

type ArtworkFormProps = {
  item: Artwork | null;
  clients: Client[];
  defaultClientId?: string;
  onSave: (item: Partial<Artwork>) => Promise<string | null>;
  onClose: () => void;
};

export const ArtworkForm: React.FC<ArtworkFormProps> = ({ item, clients, defaultClientId, onSave, onClose }) => {
  const [form, setForm] = useState<Partial<Artwork>>(
    item || {
      title: '',
      artist: '',
      year: '',
      medium: '',
      dimensions: '',
      cost: undefined,
      price: undefined,
      condition: 'Excellent',
      location: '',
      provenance: '',
      exhibition: '',
      literature: '',
      notes: '',
      client_id: defaultClientId || '',
      image_data_url: '',
    }
  );
  const [imgPreview, setImgPreview] = useState(form.image_data_url || form.image_data || '');
  const [documents, setDocuments] = useState<ArtworkDocument[]>([]);
  const [newDocuments, setNewDocuments] = useState<Array<{file: File, description: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item?.id) {
      loadDocuments(item.id);
    }
  }, [item?.id]);

  const loadDocuments = async (artworkId: string) => {
    try {
      const { data, error } = await supabase
        .from('artwork_documents')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
    }
  };

  const onImg = async (f: File | undefined) => {
    if (!f) return;
    const url = await fileToDataURL(f);
    setForm({ ...form, image_data_url: url });
    setImgPreview(url);
  };

  const addDocument = (file: File) => {
    setNewDocuments([...newDocuments, { file, description: '' }]);
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  const updateDocumentDescription = (index: number, description: string) => {
    const updated = [...newDocuments];
    updated[index].description = description;
    setNewDocuments(updated);
  };

  const deleteDocument = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const { error } = await supabase
        .from('artwork_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error: any) {
      alert('Failed to delete document: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const artworkId = await onSave(form);

      if (newDocuments.length > 0 && artworkId) {
        for (const doc of newDocuments) {
          const fileData = await fileToDataURL(doc.file);
          const { error } = await supabase.from('artwork_documents').insert([{
            artwork_id: artworkId,
            file_name: doc.file.name,
            file_data: fileData,
            file_type: doc.file.type,
            file_size: doc.file.size,
            description: doc.description || null,
          }]);

          if (error) {
            console.error('Error uploading document:', error);
            alert(`Failed to upload ${doc.file.name}: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      alert('Failed to save artwork: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Artist *</label>
          <input
            type="text"
            value={form.artist || ''}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="text"
            value={form.year || ''}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
          <input
            type="text"
            value={form.medium || ''}
            onChange={(e) => setForm({ ...form, medium: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
          <input
            type="text"
            value={form.dimensions || ''}
            onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="20 × 16 in"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
          <input
            type="number"
            value={form.cost || ''}
            onChange={(e) => setForm({ ...form, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appraisal Value</label>
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select
            value={form.condition || 'Excellent'}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option>Excellent</option>
            <option>Very Good</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          value={form.location || ''}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Provenance</label>
        <textarea
          value={form.provenance || ''}
          onChange={(e) => setForm({ ...form, provenance: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Exhibition</label>
        <textarea
          value={form.exhibition || ''}
          onChange={(e) => setForm({ ...form, exhibition: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Literature</label>
        <textarea
          value={form.literature || ''}
          onChange={(e) => setForm({ ...form, literature: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => onImg(e.target.files?.[0])}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="text-xs text-gray-500 mt-1">JPEG/PNG recommended</div>
        </div>
        <div className="flex items-center justify-center">
          {imgPreview ? (
            <img src={imgPreview} alt="" className="w-32 h-32 object-cover rounded-md border" />
          ) : (
            <div className="w-32 h-32 rounded-md border bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Client</label>
        <select
          value={form.client_id || ''}
          onChange={(e) => setForm({ ...form, client_id: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Unassigned</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Additional Documents</label>

        {documents.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-gray-600 mb-2">Existing Documents:</p>
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{doc.file_name}</div>
                    {doc.description && (
                      <div className="text-xs text-gray-600">{doc.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.file_data}
                    download={doc.file_name}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {newDocuments.map((doc, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium text-gray-900">{doc.file.name}</div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={doc.description}
                  onChange={(e) => updateDocumentDescription(idx, e.target.value)}
                  className="w-full px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-600">
                  {(doc.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeNewDocument(idx)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Upload Document (PDF, Word, Excel, Images)</span>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  addDocument(file);
                  e.target.value = '';
                }
              }}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Supported: PDF, Word, Excel, Images (Max 10MB per file)
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : item ? 'Update' : 'Add'} {loading ? '' : 'Artwork'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
