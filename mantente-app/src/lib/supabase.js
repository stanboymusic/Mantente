// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// 1. Lee las variables de entorno de Vite desde import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Valida que las variables existan
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: Faltan las variables de entorno de Supabase.");
    console.error("Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.local (para desarrollo) y en Vercel (para producción).");
    // Puedes lanzar un error si prefieres detener la app
    // throw new Error("Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY");
}

// 3. Crea el cliente
// Si las variables no existen, createClient fallará, 
// pero es mejor validar antes como hicimos arriba.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;