'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/context/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CompanyProfile {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export default function ProfilePage() {
  const { supabase, session } = useSupabase();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      loadCompanyProfile();
    }
  }, [session?.user?.id]);

  const loadCompanyProfile = async () => {
    try {
      console.log('Fetching company profile...');
      const { data, error } = await supabase
        .from('company_information')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists yet, create one
          const { data: newProfile, error: createError } = await supabase
            .from('company_information')
            .insert([{
              company_name: 'My Company',
              contact_email: session?.user?.email || '',
              contact_phone: '',
              address: ''
            }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Failed to create company profile');
            return;
          }

          setProfile(newProfile);
          toast.success('Company profile created');
        } else {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load company profile');
        }
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('company_information')
        .update({
          company_name: profile.company_name,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          address: profile.address
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div className="p-4">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-black">Company Profile</h1>

      {profile ? (
        <form onSubmit={updateProfile} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Company Name</label>
            <Input
              type="text"
              value={profile.company_name}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              required
              className="text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Contact Email</label>
            <Input
              type="email"
              value={profile.contact_email}
              onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
              className="text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Contact Phone</label>
            <Input
              type="tel"
              value={profile.contact_phone}
              onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
              className="text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">Address</label>
            <Textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="text-black"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      ) : (
        <div className="text-center py-8">Loading profile...</div>
      )}
    </div>
  );
} 