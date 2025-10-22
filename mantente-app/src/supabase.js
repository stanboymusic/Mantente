import { createClient } from "@supabase/supabase-js";

// 🌐 Configuración de Supabase
// Usa las variables de entorno definidas en tu archivo `.env.local`
// Ejemplo:
// VITE_SUPABASE_URL=https://xxxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar configuración
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Error: Falta configurar las variables de entorno de Supabase.");
  console.error("Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local");
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exportar funciones útiles (opcional)
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error al cerrar sesión:", error.message);
};
