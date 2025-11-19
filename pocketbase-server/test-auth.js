import PocketBase from 'pocketbase';

const pb = new PocketBase('https://mantente-pocketbase.fly.dev');

try {
  const result = await pb.admins.authWithPassword('mantenteapp@gmail.com', '31671702');
  console.log('✅ Auth OK:', result.record.email);
} catch (error) {
  console.log('❌ Error:', error.message, error.status);
}
