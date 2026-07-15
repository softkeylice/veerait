import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

async function init() {
  try {
    const res = await fetch('/api/config/supabase-client');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        (window as any).__SUPABASE_URL = data.supabaseUrl;
        (window as any).__SUPABASE_ANON_KEY = data.supabaseAnonKey;
        console.log('[MAIN] Loaded dynamic Supabase config from server:', data.supabaseUrl);
        try {
          const { updateSupabaseConfigStatus } = await import('./lib/supabase');
          updateSupabaseConfigStatus();
        } catch (e) {
          console.warn('[MAIN] Could not update Supabase configuration status dynamically:', e);
        }
      }
    }
  } catch (err) {
    console.warn('[MAIN] Error fetching dynamic Supabase config:', err);
  }

  const { default: App } = await import('./App.tsx');

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();

