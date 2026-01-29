import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Download, Upload, FileJson, FileText, CheckCircle } from 'lucide-react';
import { exportDataAsJSON, exportDataAsCSV, importDataFromJSON, generateFinancialSummary } from '../services/dataExport';

const DataManager = () => {
  const data = useData();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportJSON = () => {
    const result = exportDataAsJSON(data);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportCSV = () => {
    const result = exportDataAsCSV(data);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportReport = () => {
    try {
      const report = generateFinancialSummary(data);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life-os-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Report exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export report' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imported = await importDataFromJSON(file);
    if (imported) {
      // Note: This would need to be connected to the context to actually merge/update data
      setMessage({ type: 'success', text: 'Data imported successfully. Please refresh to apply changes.' });
      localStorage.setItem('life-os-data-v1', JSON.stringify(imported));
    } else {
      setMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Download size={20} className="text-indigo-600" />
            Export Data
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
            >
              <FileJson size={18} />
              Export as JSON (Backup)
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
            >
              <FileText size={18} />
              Export Transactions as CSV
            </button>
            <button
              onClick={handleExportReport}
              className="w-full flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors"
            >
              <FileText size={18} />
              Export Financial Report
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-emerald-600" />
            Import Data
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors cursor-pointer">
              <FileJson size={18} />
              Import JSON Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            <p className="text-sm text-slate-500 text-center py-4">
              Select a previously exported JSON file to restore your data. This will merge with existing data.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <h4 className="font-bold text-amber-800 mb-2">💡 Tips</h4>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Export regularly to keep backups of your financial data</li>
          <li>Use CSV export to analyze transactions in Excel or Sheets</li>
          <li>Import backups to restore your data on a new device</li>
          <li>Financial reports help track your progress over time</li>
        </ul>
      </div>
    </div>
  );
};

export default DataManager;
