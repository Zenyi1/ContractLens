import { useState } from 'react';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

export type TermStatus = 'pending' | 'accepted' | 'rejected' | 'negotiated';

export interface Term {
  id: string;
  title: string;
  description: string;
  status: TermStatus;
  sellerVersion: string;
  buyerVersion: string;
  notes?: string;
}

interface TermsCardProps {
  term: Term;
  onStatusChange: (id: string, status: TermStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export function TermsCard({ term, onStatusChange, onNotesChange }: TermsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(term.notes || '');

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    negotiated: 'bg-blue-100 text-blue-700',
  };

  const statusIcons = {
    pending: <Clock className="w-5 h-5" />,
    accepted: <Check className="w-5 h-5" />,
    rejected: <X className="w-5 h-5" />,
    negotiated: <AlertCircle className="w-5 h-5" />,
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setLocalNotes(newNotes);
    onNotesChange(term.id, newNotes);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{term.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{term.description}</p>
          </div>
          <div className="ml-4 flex items-center space-x-2">
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <button
                key={status}
                onClick={() => onStatusChange(term.id, status as TermStatus)}
                className={`p-2 rounded-full ${colorClass} ${
                  term.status === status ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                title={status.charAt(0).toUpperCase() + status.slice(1)}
              >
                {statusIcons[status as TermStatus]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Seller's Version</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{term.sellerVersion}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Buyer's Version</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{term.buyerVersion}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <textarea
                value={localNotes}
                onChange={handleNotesChange}
                className="w-full text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add your notes here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 