// Script para crear la colección tutorial_completado desde el navegador
// Ejecutar en la consola del navegador en https://mantente-pocketbase.fly.dev/_/

import PocketBase from 'https://unpkg.com/pocketbase@0.21.3/dist/pocketbase.es.mjs';

const pb = new PocketBase('https://mantente-pocketbase.fly.dev');

// Primero autenticarse como admin
await pb.admins.authWithPassword('mantenteapp@gmail.com', '31671702');

const collectionData = {
  name: "tutorial_completado",
  type: "base",
  fields: [
    {
      name: "user_id",
      type: "text",
      required: true
    },
    {
      name: "tutorial_version",
      type: "text"
    },
    {
      name: "completado",
      type: "bool"
    },
    {
      name: "fecha_completado",
      type: "date"
    }
  ]
};

try {
  const result = await pb.collections.create(collectionData);
  console.log('✅ Colección tutorial_completado creada:', result);
} catch (error) {
  console.error('❌ Error creando colección:', error);
}