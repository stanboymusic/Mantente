// src/lib/pocketbase.js
import PocketBase from 'pocketbase';

// src/lib/pocketbase.js

// 🚨 REEMPLAZA ESTA LÍNEA
const PUBLIC_URL = 'https://mantente.onrender.com'; 
const LOCAL_URL = 'http://127.0.0.1:8090'; // Déjala igual para pruebas locales

// ... el resto del código
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? PUBLIC_URL : LOCAL_URL;

const pb = new PocketBase(baseUrl);

export default pb;