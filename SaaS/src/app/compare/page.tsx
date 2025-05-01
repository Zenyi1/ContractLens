'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function ComparePage() {
  const [sellerFile, setSellerFile] = useState<File | null>(null);
  const [buyerFile, setBuyerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ pdf: string; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'seller' | 'buyer') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'seller') {
        setSellerFile(file);
      } else {
        setBuyerFile(file);
      }
    }
  };

  const handleCompare = async () => {
    if (!sellerFile || !buyerFile) {
      setError('Please upload both contract files');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('seller_tc', sellerFile);
      formData.append('buyer_tc', buyerFile);

      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process documents');
      }

      const data = await response.json();
      setResult(data);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Analysis</h1>
          <p className="text-lg text-gray-600">
            Upload your contracts to identify risks, compare terms, and get actionable insights
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Upload Contract Documents</h3>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Your Company's Contract Template
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (Max. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'seller')}
                    />
                  </label>
                </div>
                {sellerFile && (
                  <p className="text-sm text-gray-500 truncate">
                    Selected: {sellerFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Client's Contract Document
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (Max. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'buyer')}
                    />
                  </label>
                </div>
                {buyerFile && (
                  <p className="text-sm text-gray-500 truncate">
                    Selected: {buyerFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCompare}
                disabled={loading || !sellerFile || !buyerFile}
                className={`px-4 py-2 rounded-md text-white font-medium flex items-center
                  ${loading || !sellerFile || !buyerFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#4A7CFF] hover:bg-blue-700'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Contracts...
                  </>
                ) : (
                  'Analyze Contracts'
                )}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis Results</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Summary of Key Issues</h3>
                <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result.summary}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Annotated Contract</h3>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={`data:application/pdf;base64,${result.pdf}`}
                    className="w-full h-[600px]"
                    title="Annotated Contract"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 