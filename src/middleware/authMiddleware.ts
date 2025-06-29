import { authService } from '../services/authService';

export interface RouteGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export class AuthMiddleware {
  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  // Check if user has required role
  static hasRole(role: string): boolean {
    return authService.hasRole(role);
  }

  // Check if user has any of the required roles
  static hasAnyRole(roles: string[]): boolean {
    return authService.hasAnyRole(roles);
  }

  // Check if user has required permission
  static hasPermission(permission: string): boolean {
    return authService.hasPermission(permission);
  }

  // Check if user has any of the required permissions
  static hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => authService.hasPermission(permission));
  }

  // Route guard function
  static canAccess(options: RouteGuardOptions): {
    allowed: boolean;
    reason?: string;
    redirectTo?: string;
  } {
    const {
      requireAuth = true,
      allowedRoles = [],
      requiredPermissions = [],
      redirectTo = '/login'
    } = options;

    // Check authentication requirement
    if (requireAuth && !this.isAuthenticated()) {
      return {
        allowed: false,
        reason: 'Authentication required',
        redirectTo
      };
    }

    // Check role requirements
    if (allowedRoles.length > 0 && !this.hasAnyRole(allowedRoles)) {
      return {
        allowed: false,
        reason: 'Insufficient role permissions',
        redirectTo: '/unauthorized'
      };
    }

    // Check permission requirements
    if (requiredPermissions.length > 0 && !this.hasAnyPermission(requiredPermissions)) {
      return {
        allowed: false,
        reason: 'Insufficient permissions',
        redirectTo: '/unauthorized'
      };
    }

    return { allowed: true };
  }

  // Session timeout handler
  static handleSessionTimeout(): void {
    authService.logout();
    window.location.href = '/login?reason=session-timeout';
  }

  // Initialize auth middleware
  static initialize(): void {
    // Listen for session timeout events
    window.addEventListener('auth:session-timeout', this.handleSessionTimeout);

    // Listen for logout events
    window.addEventListener('auth:logout', () => {
      // Clear any cached data
      // Redirect to login if on protected route
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
      
      if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/verify-email')) {
        window.location.href = '/login';
      }
    });

    // Check token validity on page load
    this.validateSession();
  }

  // Validate current session
  static async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Try to refresh token to validate session
      const isValid = await authService.refreshToken();
      
      if (!isValid) {
        await authService.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      await authService.logout();
      return false;
    }
  }

  // Cleanup middleware
  static cleanup(): void {
    window.removeEventListener('auth:session-timeout', this.handleSessionTimeout);
  }
}

// Rate limiting for login attempts
export class LoginRateLimiter {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly STORAGE_KEY = 'abathwa_login_attempts';

  static getAttempts(): { count: number; lastAttempt: number } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
  }

  static recordAttempt(): void {
    const attempts = this.getAttempts();
    const now = Date.now();

    // Reset if lockout period has passed
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
  }

  static isLocked(): boolean {
    const attempts = this.getAttempts();
    const now = Date.now();

    // Check if locked and lockout period hasn't passed
    return attempts.count >= this.MAX_ATTEMPTS && 
           (now - attempts.lastAttempt) < this.LOCKOUT_DURATION;
  }

  static getRemainingLockoutTime(): number {
    const attempts = this.getAttempts();
    const now = Date.now();
    const remaining = this.LOCKOUT_DURATION - (now - attempts.lastAttempt);
    return Math.max(0, remaining);
  }

  static reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getAttemptsRemaining(): number {
    const attempts = this.getAttempts();
    return Math.max(0, this.MAX_ATTEMPTS - attempts.count);
  }
}

// CSRF Protection
export class CSRFProtection {
  private static readonly TOKEN_HEADER = 'X-CSRF-TOKEN';
  private static readonly TOKEN_META = 'csrf-token';

  static getToken(): string | null {
    const metaTag = document.querySelector(`meta[name="${this.TOKEN_META}"]`);
    return metaTag ? metaTag.getAttribute('content') : null;
  }

  static setToken(token: string): void {
    let metaTag = document.querySelector(`meta[name="${this.TOKEN_META}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', this.TOKEN_META);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', token);
  }

  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { [this.TOKEN_HEADER]: token } : {};
  }

  static isValidRequest(request: Request): boolean {
    const token = this.getToken();
    const requestToken = request.headers.get(this.TOKEN_HEADER);
    
    // Allow GET requests without CSRF token
    if (request.method === 'GET') {
      return true;
    }

    return token && requestToken && token === requestToken;
  }
}

// Initialize middleware on module load
AuthMiddleware.initialize();