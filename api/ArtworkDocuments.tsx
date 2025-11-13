import React, { useState, useEffect } from 'react';
import { FileText, Download, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ArtworkDocument } from '../lib/supabase';

type ArtworkDocumentsProps = {
  artworkId: string;
  artworkTitle: string;
  onClose: () => void;
};

export const ArtworkDocuments: React.FC<ArtworkDocumentsProps> = ({
  artworkId,
  artworkTitle,
  onClose,
}) => {
  const [documents, setDocuments] = useState<ArtworkDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [artworkId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artwork_documents')
        .select('*')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Documents</h2>
            <p className="text-sm text-gray-600 mt-1">{artworkTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{doc.file_name}</div>
                      {doc.description && (
                        <div className="text-sm text-gray-600">{doc.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.file_data}
                      download={doc.file_name}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
