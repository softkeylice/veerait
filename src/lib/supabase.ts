import { createClient } from '@supabase/supabase-js';

// Get current configured values
const getUrl = () => (window as any).__SUPABASE_URL || ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const getKey = () => (window as any).__SUPABASE_ANON_KEY || ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export let isSupabaseConfigured = Boolean(getUrl() && getKey());

let supabaseClientInstance: any = null;

export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;
  const url = getUrl();
  const key = getKey();
  if (url && key) {
    supabaseClientInstance = createClient(url, key);
    return supabaseClientInstance;
  }
  return null;
}

export function updateSupabaseConfigStatus() {
  isSupabaseConfigured = Boolean(getUrl() && getKey());
  getSupabaseClient(); // Prefetch/initialize if credentials are now available
}

// Proxy for the supabase client to ensure it is always dynamically resolved
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      return undefined;
    }
    const val = client[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

if (isSupabaseConfigured) {
  console.log('[SUPABASE] Live client successfully initialized for the frontend browser.');
} else {
  console.warn('[SUPABASE] No VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY provided. Operating in high-performance local simulated mode.');
}
