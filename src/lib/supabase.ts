import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Test if Supabase is accessible
let isSupabaseAvailable = true;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      console.warn('Supabase connection failed, falling back to mock API');
      return false;
    }
    return true;
  } catch (error) {
    isSupabaseAvailable = false;
    console.warn('Supabase connection test failed:', error);
    return false;
  }
};

// Initialize connection test
testSupabaseConnection();

// Auth helpers with error handling
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { user, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

// Database helpers with error handling
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const getOpportunities = async (filters?: any) => {
  try {
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
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const createOpportunity = async (opportunityData: any) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunityData)
      .select()
      .single()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const getInvestments = async (userId: string, role: string) => {
  try {
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
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const createInvestmentOffer = async (offerData: any) => {
  try {
    const { data, error } = await supabase
      .from('investment_offers')
      .insert(offerData)
      .select()
      .single()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const getNotifications = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error && error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    
    return { data, error }
  } catch (error: any) {
    if (error.message === 'SUPABASE_UNAVAILABLE' || error.message.includes('Failed to fetch')) {
      isSupabaseAvailable = false;
      throw new Error('SUPABASE_UNAVAILABLE');
    }
    throw error;
  }
}

// Export availability checker
export const checkSupabaseAvailability = () => isSupabaseAvailable;