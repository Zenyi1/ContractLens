import React, { useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

function UploadForm() {
  const [sellerFile, setSellerFile] = useState(null);
  const [buyerFile, setBuyerFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [changes, setChanges] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellerFile || !buyerFile) {
      setError('Please select both files');
      return;
    }

    setIsProcessing(true);
    setError('');
    setChanges(null);

    const formData = new FormData();
    formData.append('seller_tc', sellerFile);
    formData.append('buyer_tc', buyerFile);

    try {
      const response = await axios.post('http://localhost:8000/process', formData);
      setChanges(response.data);
    } catch (err) {
      setError('Error processing documents. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (!changes?.pdf) return;
    
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${changes.pdf}`;
    link.download = 'annotated.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadSummary = () => {
    if (!changes?.summary) return;
    
    const blob = new Blob([changes.summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'changes_summary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Seller's T&Cs
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSellerFile(e.target.files[0])}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Buyer's T&Cs
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setBuyerFile(e.target.files[0])}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isProcessing ? <Spinner /> : 'Process Documents'}
        </button>
      </form>

      {changes && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Suggested Changes</h2>
          
          <div className="bg-white shadow rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {changes.summary}
            </pre>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download Annotated PDF
            </button>
            <button
              onClick={downloadSummary}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download Changes Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm; 