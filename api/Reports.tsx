import React from 'react';
import { Download, FileArchive, FileUp, FilePlus2, FileCheck } from 'lucide-react';

type ReportsProps = {
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportZip: () => void;
  onBulkImport: () => void;
  setBulkSheet: (file: File | null) => void;
  setBulkZip: (file: File | null) => void;
  bulkBusy: boolean;
  bulkSheetSelected: boolean;
};

export const Reports: React.FC<ReportsProps> = ({
  onExportExcel,
  onExportCSV,
  onExportZip,
  onBulkImport,
  setBulkSheet,
  setBulkZip,
  bulkBusy,
  bulkSheetSelected,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onExportExcel}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <Download className="w-8 h-8 text-blue-600" />
          <div className="text-left">
            <div className="font-semibold text-gray-900">Inventory (Excel)</div>
            <div className="text-sm text-gray-600">XLSX workbook</div>
          </div>
        </button>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
        >
          <Download className="w-8 h-8 text-green-600" />
          <div className="text-left">
            <div className="font-semibold text-gray-900">Inventory (CSV)</div>
            <div className="text-sm text-gray-600">Quick spreadsheet</div>
          </div>
        </button>
        <button
          onClick={onExportZip}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition"
        >
          <FileArchive className="w-8 h-8 text-orange-600" />
          <div className="text-left">
            <div className="font-semibold text-gray-900">Fact Sheets (ZIP)</div>
            <div className="text-sm text-gray-600">PDF per artwork</div>
          </div>
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Upload</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <label className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
          <FileUp className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-semibold text-gray-900">CSV/XLSX</div>
            <div className="text-sm text-gray-600">First sheet used</div>
          </div>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => setBulkSheet(e.target.files?.[0] || null)}
          />
        </label>
        <label className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition">
          <FilePlus2 className="w-6 h-6 text-teal-600" />
          <div>
            <div className="font-semibold text-gray-900">Images ZIP (optional)</div>
            <div className="text-sm text-gray-600">Match filenames</div>
          </div>
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => setBulkZip(e.target.files?.[0] || null)}
          />
        </label>
        <button
          disabled={!bulkSheetSelected || bulkBusy}
          onClick={onBulkImport}
          className={`flex items-center justify-center gap-3 p-4 rounded-lg ${
            (!bulkSheetSelected || bulkBusy)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <FileCheck className="w-6 h-6" />
          {bulkBusy ? 'Importing...' : 'Import'}
        </button>
      </div>
      <div className="text-sm text-gray-600 mt-3">
        Required headers: <code className="bg-gray-100 px-2 py-1 rounded">client_email, artist, title</code>.
        Optional: <code className="bg-gray-100 px-2 py-1 rounded">year, medium, dimensions, condition, location, price, provenance, exhibition, literature, notes, primary_image_filename</code>
      </div>
    </div>
  </div>
);
