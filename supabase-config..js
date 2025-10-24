// Copiá este archivo a "supabase-config.js" y completá tus credenciales.
// El archivo real está ignorado por Git para que no se suban claves sensibles.

// Podés instalar supabase-js desde un CDN sin herramientas adicionales.
// Si preferís usar otra ruta, asegurate de exponer "supabaseClient" como exportación.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplazá las siguientes constantes con los datos de tu proyecto Supabase.
const SUPABASE_URL = 'https://lnpalecpfyxwnbvnntcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucGFsZWNwZnl4d25idm5udGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTgxMzUsImV4cCI6MjA3Njg3NDEzNX0.UJ1G-_S9IDJtotC8HnJerQDabkkDFGBSJ7M-C2ctBSc';

export const tableName = 'news_posts';
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
