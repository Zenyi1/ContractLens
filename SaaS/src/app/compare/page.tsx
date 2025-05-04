'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { supabase } from '@/utils/supabase';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { TermsCard, Term, TermStatus } from '@/components/shared/TermsCard';

// Get API URL from environment variable or use a fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-deployed-backend-url.com';

export default function ComparePage() {
  const [sellerFile, setSellerFile] = useState<File | null>(null);
  const [buyerFile, setBuyerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; terms: Term[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { session } = useAuth();
  const { company, isLoading: isCompanyLoading } = useCompany();

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

  const handleStatusChange = (termId: string, newStatus: TermStatus) => {
    setTerms(prevTerms =>
      prevTerms.map(term =>
        term.id === termId ? { ...term, status: newStatus } : term
      )
    );
  };

  const handleNotesChange = (termId: string, notes: string) => {
    setTerms(prevTerms =>
      prevTerms.map(term =>
        term.id === termId ? { ...term, notes } : term
      )
    );
  };

  const redirectToProfile = () => {
    router.push('/profile');
  };

  const handleCompare = async () => {
    if (!sellerFile || !buyerFile) {
      setError('Please upload both contract files');
      return;
    }

    if (!session) {
      setError('You must be logged in to use this feature');
      router.push('/log-in');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('seller_tc', sellerFile);
      formData.append('buyer_tc', buyerFile);

      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        throw new Error('Failed to process documents');
      }

      const data = await response.json();
      
      // Parse the analysis text into structured terms
      const analysisText = data.summary || '';
      
      // Split the text into sentences
      const sentences = analysisText.split(/[.!?](?=\s|$)/).filter((s: string) => s.trim().length > 0);
      
      // Group related sentences into topics
      const topics = [
        { key: 'definitions', title: 'Definitions and Terms', keywords: ['definition', 'terms', 'clarity'] },
        { key: 'payment', title: 'Payment Terms', keywords: ['payment', 'cash flow', 'financial', 'interest', 'withhold'] },
        { key: 'delivery', title: 'Delivery and Equipment', keywords: ['delivery', 'equipment', 'return', 'operational'] },
        { key: 'ip', title: 'Intellectual Property', keywords: ['intellectual property', 'ownership', 'assets'] },
        { key: 'personnel', title: 'Personnel and Safety', keywords: ['personnel', 'security', 'safety', 'compliance'] },
        { key: 'liability', title: 'Liability and Indemnification', keywords: ['liability', 'indemnif', 'damage', 'risk'] },
        { key: 'termination', title: 'Termination Rights', keywords: ['terminat', 'default', 'rights'] }
      ];

      const topicContents: { [key: string]: string[] } = {};
      
      // Categorize sentences into topics
      sentences.forEach((sentence: string) => {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) return;

        // Find matching topics for this sentence
        const matchingTopics = topics.filter(topic =>
          topic.keywords.some(keyword => 
            trimmedSentence.toLowerCase().includes(keyword.toLowerCase())
          )
        );

        // Add sentence to all matching topics
        matchingTopics.forEach(topic => {
          if (!topicContents[topic.key]) {
            topicContents[topic.key] = [];
          }
          topicContents[topic.key].push(trimmedSentence);
        });
      });

      // Transform topics into terms
      const transformedTerms = topics
        .filter(topic => topicContents[topic.key]?.length > 0)
        .map((topic, index) => {
          const content = topicContents[topic.key];
          
          // Split content into buyer's and seller's versions if possible
          const buyerContent = content.filter(s => s.toLowerCase().includes('buyer')).join(' ');
          const sellerContent = content.filter(s => 
            s.toLowerCase().includes('thrift+') || 
            s.toLowerCase().includes('seller')
          ).join(' ');
          
          return {
            id: `term-${index}`,
            title: topic.title,
            description: content.join(' '),
            status: 'pending' as TermStatus,
            buyerVersion: buyerContent || 'Buyer version not specified',
            sellerVersion: sellerContent || 'Seller version not specified',
            notes: ''
          };
        });

      setTerms(transformedTerms);
      setResult({
        terms: transformedTerms,
        summary: data.summary || 'No additional notes available'
      });
      
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while processing the documents. Please try again.');
      
      if (error.message.includes('Authentication failed')) {
        // Force sign out on auth error
        await supabase.auth.signOut();
        router.push('/log-in');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show a loading state while company data is being fetched
  if (isCompanyLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading your company information...</span>
        </div>
      </AuthenticatedLayout>
    );
  }

  // If the company profile doesn't exist, prompt the user to create one
  if (!company?.name) {
    return (
      <AuthenticatedLayout>
        <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white shadow sm:rounded-lg overflow-hidden p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ContractLens!</h2>
              <p className="text-gray-600 mb-6">
                Before you start analyzing contracts, please take a moment to set up your company profile.
                This information will be used to personalize your contract analysis.
              </p>
              <button
                onClick={redirectToProfile}
                className="px-4 py-2 rounded-md text-white font-medium bg-[#4A7CFF] hover:bg-blue-700"
              >
                Set Up Company Profile
              </button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                    {company.name}&apos;s Contract Template
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
                    Client&apos;s Contract Document
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
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contract Terms Analysis</h3>
                  <div className="space-y-4">
                    {terms.map((term) => (
                      <TermsCard
                        key={term.id}
                        term={term}
                        onStatusChange={handleStatusChange}
                        onNotesChange={handleNotesChange}
                      />
                    ))}
                  </div>
                </div>

                {result.summary && terms.length === 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Details</h3>
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-gray-900">{result.summary}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 