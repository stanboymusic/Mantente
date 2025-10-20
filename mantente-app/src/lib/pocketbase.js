// src/lib/pocketbase.js
import PocketBase from 'pocketbase';

// 🚨 Confirma que usas esta URL
const PUBLIC_URL = 'https://mantente.fly.dev'; 
const LOCAL_URL = 'http://127.0.0.1:8090';

const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? PUBLIC_URL : LOCAL_URL;

const pb = new PocketBase(baseUrl);

export default pb;