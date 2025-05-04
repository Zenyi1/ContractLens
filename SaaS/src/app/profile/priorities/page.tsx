'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Priority {
  id: string;
  priority_name: string;
  priority_description: string;
  priority_weight: number;
  is_active: boolean;
}

export default function ContractPriorities() {
  const { supabase, session } = useSupabase();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState({
    priority_name: '',
    priority_description: '',
    priority_weight: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Session user ID:', session.user.id);
      loadPriorities();
    } else {
      console.log('No session or user ID found');
    }
  }, [session?.user?.id]);

  const loadPriorities = async () => {
    try {
      console.log('Fetching company information...');
      const { data: companyData, error: companyError } = await supabase
        .from('company_information')
        .select('id')
        .single();

      if (companyError) {
        // For first-time users, create a company record
        if (companyError.code === 'PGRST116') {
          // First, let's check if the user exists
          if (!session?.user?.id) {
            console.error('No user session found');
            toast.error('Please log in to continue');
            return;
          }

          console.log('Creating new company record...');
          // Create a new company record with required fields
          const { data: newCompany, error: createError } = await supabase
            .from('company_information')
            .insert([{
              company_name: 'My Company', // Required field
              contact_email: session.user.email || '', // Optional
            }])
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating company:', createError);
            console.log('Full error:', JSON.stringify(createError, null, 2));
            toast.error('Failed to create company profile. Please try again.');
            return;
          }

          if (!newCompany) {
            console.error('No company created');
            toast.error('Failed to create company profile');
            return;
          }

          console.log('Company created successfully:', newCompany);
          toast.success('Company profile created');
          return loadPriorities(); // Retry after creating company
        }
        console.error('Error fetching company information:', companyError);
        toast.error('Failed to load company information');
        return;
      }

      if (!companyData) {
        console.error('No company data found');
        toast.error('No company information found');
        return;
      }

      console.log('Fetching priorities for company:', companyData.id);
      const { data, error } = await supabase
        .from('contract_priorities')
        .select('*')
        .eq('company_id', companyData.id)
        .order('priority_weight', { ascending: false });

      if (error) {
        console.error('Error fetching priorities:', error);
        toast.error('Failed to load priorities');
        return;
      }

      console.log('Priorities loaded:', data?.length || 0);
      setPriorities(data || []);
    } catch (error: any) {
      console.error('Error loading priorities:', error);
      toast.error(error.message || 'Failed to load priorities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: companyData, error: companyError } = await supabase
        .from('company_information')
        .select('id')
        .single();

      if (companyError) throw companyError;

      const { error } = await supabase
        .from('contract_priorities')
        .insert([
          {
            company_id: companyData.id,
            priority_name: newPriority.priority_name,
            priority_description: newPriority.priority_description,
            priority_weight: newPriority.priority_weight,
            is_active: true
          }
        ]);

      if (error) throw error;

      toast.success('Priority added successfully');
      setNewPriority({
        priority_name: '',
        priority_description: '',
        priority_weight: 1,
      });
      loadPriorities();
    } catch (error) {
      console.error('Error adding priority:', error);
      toast.error('Failed to add priority');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePriority = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contract_priorities')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadPriorities();
      toast.success('Priority status updated');
    } catch (error) {
      console.error('Error toggling priority:', error);
      toast.error('Failed to update priority status');
    }
  };

  const deletePriority = async (id: string) => {
    if (!confirm('Are you sure you want to delete this priority?')) return;

    try {
      const { error } = await supabase
        .from('contract_priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPriorities();
      toast.success('Priority deleted');
    } catch (error) {
      console.error('Error deleting priority:', error);
      toast.error('Failed to delete priority');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black">Contract Priorities</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Add New Priority</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Priority Name</label>
            <Input
              type="text"
              value={newPriority.priority_name}
              onChange={(e) =>
                setNewPriority({ ...newPriority, priority_name: e.target.value })
              }
              required
              placeholder="e.g., Payment Terms"
              className="text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Description</label>
            <Textarea
              value={newPriority.priority_description}
              onChange={(e) =>
                setNewPriority({
                  ...newPriority,
                  priority_description: e.target.value,
                })
              }
              required
              placeholder="Describe what aspects are important for this priority..."
              className="text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Priority Weight (1-10)
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={String(newPriority.priority_weight)}
              onChange={(e) =>
                setNewPriority({
                  ...newPriority,
                  priority_weight: parseInt(e.target.value) || 1,
                })
              }
              required
              className="text-black"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Priority'}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Current Priorities</h2>
          <div className="space-y-4">
            {priorities.map((priority) => (
              <div
                key={priority.id}
                className="border rounded p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-medium text-black">{priority.priority_name}</h3>
                  <p className="text-sm text-black">
                    {priority.priority_description}
                  </p>
                  <p className="text-sm text-black">
                    Weight: {priority.priority_weight}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant={priority.is_active ? 'default' : 'secondary'}
                    onClick={() =>
                      togglePriority(priority.id, priority.is_active)
                    }
                  >
                    {priority.is_active ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deletePriority(priority.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {priorities.length === 0 && (
              <p className="text-black text-center py-4">
                No priorities added yet. Add your first priority above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 