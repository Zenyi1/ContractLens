'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/utils/supabase'

// Get API URL from environment variable or use a fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-deployed-backend-url.com';

export type CompanyDetails = {
  name: string;
  description?: string;
  industry?: string;
  business_type?: string;
  primary_customers?: string;
  contract_preferences?: string;
}

type CompanyContextType = {
  company: CompanyDetails | null
  isLoading: boolean
  saveCompanyDetails: (details: CompanyDetails) => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, session } = useAuth()

  useEffect(() => {
    if (!user) {
      setCompany(null)
      setIsLoading(false)
      return
    }

    const fetchCompanyDetails = async () => {
      setIsLoading(true)
      try {
        // Use backend API with configurable URL
        const response = await fetch(`${API_URL}/company-profiles/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCompany({
            name: data.name,
            description: data.description,
            industry: data.industry,
            business_type: data.business_type,
            primary_customers: data.primary_customers,
            contract_preferences: data.contract_preferences
          })
        } else if (response.status === 404) {
          // Profile not found, that's okay
          setCompany(null)
        } else {
          console.error('Error fetching company profile:', await response.text())
          setCompany(null)
        }
      } catch (error) {
        console.error('Error in company fetch:', error)
        setCompany(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchCompanyDetails()
    } else {
      setIsLoading(false)
    }
  }, [user, session])

  const saveCompanyDetails = async (details: CompanyDetails) => {
    if (!user || !session) return

    try {
      // Use backend API with configurable URL
      const response = await fetch(`${API_URL}/company-profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: details.name,
          description: details.description,
          industry: details.industry,
          business_type: details.business_type,
          primary_customers: details.primary_customers,
          contract_preferences: details.contract_preferences
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save company details: ${await response.text()}`)
      }

      setCompany(details)
    } catch (error) {
      console.error('Error saving company details:', error)
      throw error
    }
  }

  return (
    <CompanyContext.Provider value={{ company, isLoading, saveCompanyDetails }}>
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