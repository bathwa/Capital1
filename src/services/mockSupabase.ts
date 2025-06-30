// Mock Supabase implementation for development
export class MockSupabaseAuth {
  private users: any[] = [];
  private currentUser: any = null;
  private session: any = null;

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
      };
    }

    // Simple password check (in real app, this would be hashed)
    if (user.password !== password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
      };
    }

    // Create session
    this.session = {
      access_token: `mock_token_${Date.now()}`,
      user: user
    };
    this.currentUser = user;

    return {
      data: { user, session: this.session },
      error: null
    };
  }

  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthError', status: 400 }
      };
    }

    // Create new user
    const newUser = {
      id: `mock_user_${Date.now()}`,
      email,
      password, // In real app, this would be hashed
      email_confirmed_at: new Date().toISOString(),
      user_metadata: options?.data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.push(newUser);

    // Create session (email confirmation disabled for development)
    this.session = {
      access_token: `mock_token_${Date.now()}`,
      user: newUser
    };
    this.currentUser = newUser;

    return {
      data: { user: newUser, session: this.session },
      error: null
    };
  }

  async signOut() {
    this.currentUser = null;
    this.session = null;
    return { error: null };
  }

  async getUser() {
    return {
      data: { user: this.currentUser },
      error: null
    };
  }

  async resetPasswordForEmail(email: string, options?: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return {
        error: { message: 'User not found', name: 'AuthError', status: 404 }
      };
    }

    console.log(`Password reset email would be sent to: ${email}`);
    return { error: null };
  }

  async updateUser(updates: any) {
    if (!this.currentUser) {
      return {
        error: { message: 'No user logged in', name: 'AuthError', status: 401 }
      };
    }

    // Update user
    Object.assign(this.currentUser, updates);
    
    // Update in users array
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.currentUser };
    }

    return {
      data: { user: this.currentUser },
      error: null
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Mock implementation - in real Supabase this would listen for auth changes
    return {
      data: { subscription: {} },
      unsubscribe: () => {}
    };
  }
}

export class MockSupabaseClient {
  auth: MockSupabaseAuth;
  private mockUsers: any[] = [];

  constructor() {
    this.auth = new MockSupabaseAuth();
  }

  from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (table === 'users') {
              const user = this.mockUsers.find(u => u[column] === value);
              if (user) {
                return { data: user, error: null };
              } else {
                return { 
                  data: null, 
                  error: { code: 'PGRST116', message: 'No rows found' }
                };
              }
            }
            
            return { data: null, error: { message: 'Table not found' } };
          }
        })
      }),
      
      insert: (data: any[]) => ({
        select: () => ({
          single: async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (table === 'users') {
              const newUser = { ...data[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
              this.mockUsers.push(newUser);
              return { data: newUser, error: null };
            }
            
            return { data: null, error: { message: 'Insert failed' } };
          }
        })
      }),
      
      update: (updates: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              await new Promise(resolve => setTimeout(resolve, 200));
              
              if (table === 'users') {
                const userIndex = this.mockUsers.findIndex(u => u[column] === value);
                if (userIndex !== -1) {
                  this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...updates, updated_at: new Date().toISOString() };
                  return { data: this.mockUsers[userIndex], error: null };
                }
              }
              
              return { data: null, error: { message: 'User not found' } };
            }
          })
        })
      })
    };
  }
}

// Create mock instance
export const mockSupabase = new MockSupabaseClient();