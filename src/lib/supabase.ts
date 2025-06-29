import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export const getOpportunities = async (filters?: any) => {
  let query = supabase
    .from('opportunities')
    .select(`
      *,
      entrepreneur:users!entrepreneur_id(first_name, last_name, organization_name),
      milestones(*)
    `)
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const createOpportunity = async (opportunityData: any) => {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(opportunityData)
    .select()
    .single()
  
  return { data, error }
}

export const getInvestments = async (userId: string, role: string) => {
  let query = supabase
    .from('investments')
    .select(`
      *,
      opportunity:opportunities(*),
      investor:users!investor_id(first_name, last_name)
    `)
  
  if (role === 'INVESTOR') {
    query = query.eq('investor_id', userId)
  } else if (role === 'ENTREPRENEUR') {
    query = query.in('opportunity_id', 
      supabase.from('opportunities').select('id').eq('entrepreneur_id', userId)
    )
  }
  
  const { data, error } = await query
  return { data, error }
}

export const createInvestmentOffer = async (offerData: any) => {
  const { data, error } = await supabase
    .from('investment_offers')
    .insert(offerData)
    .select()
    .single()
  
  return { data, error }
}

export const getNotifications = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()
  
  return { data, error }
}