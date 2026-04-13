// SalesHub Pro — Supabase Sync
// Wraps DB object to sync with Supabase in background
(async function() {
  'use strict';
  const PREFIX = 'shp_';
  let supa = null, connected = false;

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL && !SUPABASE_URL.includes('YOUR_')) {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await supa.from(typeof SITE_ID!=='undefined'&&SITE_ID?SITE_ID+'_kv_store':'kv_store').select('key').limit(1);
      connected = true;
      console.log('[SalesHub] ✅ Supabase connected');
    } catch (e) { console.warn('[SalesHub] Supabase unavailable:', e.message); }
  }

  // Wrap original DB methods
  const origGet = DB.get.bind(DB);
  const origSet = DB.set.bind(DB);
  const origDel = DB.del.bind(DB);

  DB.get = async function(k) {
    if (!connected) return origGet(k);
    try {
      const { data } = await supa.from(typeof SITE_ID!=='undefined'&&SITE_ID?SITE_ID+'_kv_store':'kv_store').select('value').eq('key', PREFIX + k).single();
      if (data) { localStorage.setItem(PREFIX + k, JSON.stringify(data.value)); return data.value; }
    } catch {}
    return origGet(k);
  };

  DB.set = async function(k, v) {
    origSet(k, v); // Always save local first
    if (!connected) return;
    try { await supa.from(typeof SITE_ID!=='undefined'&&SITE_ID?SITE_ID+'_kv_store':'kv_store').upsert({ key: PREFIX + k, value: v, updated_at: new Date().toISOString() }, { onConflict: 'key' }); }
    catch (e) { console.warn('[Sync] set failed:', e.message); }
  };

  DB.del = async function(k) {
    origDel(k);
    if (!connected) return;
    try { await supa.from(typeof SITE_ID!=='undefined'&&SITE_ID?SITE_ID+'_kv_store':'kv_store').delete().eq('key', PREFIX + k); } catch {}
  };

  // Sync all data on load
  if (connected) {
    try {
      const { data } = await supa.from(typeof SITE_ID!=='undefined'&&SITE_ID?SITE_ID+'_kv_store':'kv_store').select('key, value').like('key', PREFIX + '%');
      if (data) {
        for (const row of data) {
          const k = row.key.replace(PREFIX, '');
          localStorage.setItem(row.key, JSON.stringify(row.value));
        }
        console.log('[SalesHub] Synced', data.length, 'items from Supabase');
      }
    } catch {}
  }

  window.SUPABASE_CONNECTED = connected;
})();
