import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8091');

try {
  const result = await pb.admins.authWithPassword('mantenteapp@gmail.com', '31671702');
  console.log('✅ Auth OK:', result.record.email);
  console.log('Token:', result.token.substring(0, 20) + '...');
} catch (error) {
  console.log('❌ Error:', error.message, error.status);
}
