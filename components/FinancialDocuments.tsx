import React, { useState } from 'react';
import { FileText, Plus, Trash2, Calendar, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { FinancialDocument, FinancialToolCategory } from '../types';

const FinancialDocuments = () => {
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Identity' as FinancialToolCategory,
    documentType: '',
    name: '',
    linkedEntityId: '',
    expiryDate: '',
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.documentType) return;

    const newDoc: FinancialDocument = {
      id: Math.random().toString(),
      category: formData.category,
      documentType: formData.documentType,
      name: formData.name,
      linkedEntityId: formData.linkedEntityId,
      uploadDate: new Date().toISOString(),
      expiryDate: formData.expiryDate,
      storageLocation: `/documents/${formData.name}-${Date.now()}`,
      status: 'Active'
    };

    setDocuments([...documents, newDoc]);
    setFormData({
      category: 'Identity',
      documentType: '',
      name: '',
      linkedEntityId: '',
      expiryDate: '',
    });
    setShowForm(false);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const categorizedDocs = {
    Identity: documents.filter(d => d.category === 'Identity'),
    Banking: documents.filter(d => d.category === 'Banking'),
    Salary: documents.filter(d => d.category === 'Salary'),
    Safety: documents.filter(d => d.category === 'Safety'),
    Investment: documents.filter(d => d.category === 'Investment'),
    Credit: documents.filter(d => d.category === 'Credit'),
    Tax: documents.filter(d => d.category === 'Tax'),
    Legacy: documents.filter(d => d.category === 'Legacy'),
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const daysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Documents</h2>
          <p className="text-sm text-slate-500">Secure vault for your financial paperwork</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Add Document
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Upload Document</h3>
          <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Category</label>
              <select
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FinancialToolCategory })}
              >
                {['Identity', 'Banking', 'Salary', 'Safety', 'Investment', 'Credit', 'Tax', 'Legacy'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Document Type</label>
              <input
                type="text"
                placeholder="e.g., Policy Document, Loan Sanction Letter"
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Document Name</label>
              <input
                type="text"
                placeholder="e.g., Health Insurance Policy 2024"
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Link to (Entity ID)</label>
              <input
                type="text"
                placeholder="Optional: Link to policy/loan ID"
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                value={formData.linkedEntityId}
                onChange={(e) => setFormData({ ...formData, linkedEntityId: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Expiry Date</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents by Category */}
      <div className="space-y-8">
        {Object.entries(categorizedDocs).map(([category, docs]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">{category}</h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {docs.length}
              </span>
            </div>

            {docs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map(doc => {
                  const expired = isExpired(doc.expiryDate);
                  const daysLeft = daysUntilExpiry(doc.expiryDate);

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        expired
                          ? 'bg-rose-50 border-rose-200'
                          : daysLeft && daysLeft < 30
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <FileText
                            size={18}
                            className={`flex-shrink-0 mt-0.5 ${
                              expired
                                ? 'text-rose-600'
                                : daysLeft && daysLeft < 30
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 break-words">{doc.name}</h4>
                            <p className="text-xs text-slate-500">{doc.documentType}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-slate-400 hover:text-rose-600 flex-shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {doc.expiryDate && (
                        <div className={`flex items-center gap-2 text-xs mt-2 pt-2 border-t ${
                          expired
                            ? 'border-rose-100 text-rose-700'
                            : daysLeft && daysLeft < 30
                            ? 'border-amber-100 text-amber-700'
                            : 'border-slate-100 text-slate-600'
                        }`}>
                          <Calendar size={14} />
                          {expired ? (
                            <>
                              <AlertCircle size={14} />
                              Expired
                            </>
                          ) : daysLeft && daysLeft < 30 ? (
                            <>
                              <AlertCircle size={14} />
                              {daysLeft} days left
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              {daysLeft} days left
                            </>
                          )}
                        </div>
                      )}

                      {doc.linkedEntityId && (
                        <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded">
                          🔗 Linked to: {doc.linkedEntityId}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-100">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-3">📋 Document Organization Tips</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li><strong>Identity:</strong> Aadhaar, PAN, Passport</li>
          <li><strong>Banking:</strong> Account statements, bank cards</li>
          <li><strong>Salary:</strong> Form 16, Offer letters, Salary slips</li>
          <li><strong>Safety:</strong> Insurance policies, receipts</li>
          <li><strong>Investment:</strong> Demat account statements, mutual fund docs</li>
          <li><strong>Credit:</strong> Credit reports, loan documents</li>
          <li><strong>Tax:</strong> ITR, Form 26AS, investment proofs</li>
          <li><strong>Legacy:</strong> Will, nominations, family documents</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialDocuments;
