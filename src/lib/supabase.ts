import { createClient } from '@supabase/supabase-js';
import { SECURITY_CONSTANTS } from './security';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth',
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-CSRF-Token': localStorage.getItem('csrf-token') || ''
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Initialize CSRF token
if (!localStorage.getItem('csrf-token')) {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  localStorage.setItem('csrf-token', token);
}

// Session management
let sessionTimeout: NodeJS.Timeout;

const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session) {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
      supabase.auth.signOut();
    }, SECURITY_CONSTANTS.SESSION_DURATION);
  }
};

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    refreshSession();
  } else if (event === 'SIGNED_OUT') {
    clearTimeout(sessionTimeout);
  }
});

// Refresh session on activity
document.addEventListener('mousemove', refreshSession);
document.addEventListener('keypress', refreshSession);