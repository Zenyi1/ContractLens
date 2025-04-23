import React from 'react';
import UploadForm from './components/UploadForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              T&Cs Document Processor
            </h1>
            <UploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 