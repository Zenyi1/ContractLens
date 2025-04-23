import React, { useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

function UploadForm() {
  const [sellerFile, setSellerFile] = useState(null);
  const [buyerFile, setBuyerFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sellerFile || !buyerFile) {
      setError('Please select both files');
      return;
    }

    setIsProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('seller_tc', sellerFile);
    formData.append('buyer_tc', buyerFile);

    try {
      const response = await axios.post('http://localhost:8000/process', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'annotated.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error processing documents. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
  );
}

export default UploadForm; 