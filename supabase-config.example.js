// Copiá este archivo a "supabase-config.js" y completá tus credenciales.
// El archivo real está ignorado por Git para que no se suban claves sensibles.

// Podés instalar supabase-js desde un CDN sin herramientas adicionales.
// Si preferís usar otra ruta, asegurate de exponer "supabaseClient" como exportación.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Reemplazá las siguientes constantes con los datos de tu proyecto Supabase.
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';

export const tableName = 'news_posts';
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
