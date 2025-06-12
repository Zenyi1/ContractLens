'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSupabase } from './SupabaseProvider'
import { toast } from 'sonner'

export interface CompanyDetails {
  id?: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

interface CompanyContextType {
  company: CompanyDetails | null;
  isLoading: boolean;
  saveCompanyDetails: (details: CompanyDetails) => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { supabase, session } = useSupabase()
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCompany = async () => {
    try {
      if (!session?.user?.id) {
        setCompany(null)
        return
      }

      const { data, error } = await supabase
        .from('company_information')
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No company profile exists yet
          setCompany(null)
        } else {
          console.error('Error fetching company:', error)
          toast.error('Failed to load company information')
        }
        return
      }

      setCompany(data)
    } catch (error) {
      console.error('Error in company fetch:', error)
      toast.error('Failed to load company information')
    } finally {
      setIsLoading(false)
    }
  }

  const saveCompanyDetails = async (details: CompanyDetails) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user')
      }

      let result
      
      if (company?.id) {
        // Update existing company
        result = await supabase
          .from('company_information')
          .update({
            company_name: details.company_name,
            contact_email: details.contact_email,
            contact_phone: details.contact_phone,
            address: details.address
          })
          .eq('id', company.id)
      } else {
        // Create new company
        result = await supabase
          .from('company_information')
          .insert([{
            company_name: details.company_name,
            contact_email: details.contact_email,
            contact_phone: details.contact_phone,
            address: details.address
          }])
      }

      if (result.error) {
        throw result.error
      }

      await fetchCompany()
      toast.success('Company details saved successfully')
    } catch (error) {
      console.error('Error saving company details:', error)
      toast.error('Failed to save company details')
      throw error
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchCompany()
    }
  }, [session?.user?.id])

  return (
    <CompanyContext.Provider value={{ 
      company, 
      isLoading, 
      saveCompanyDetails,
      refreshCompany: fetchCompany
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
} 