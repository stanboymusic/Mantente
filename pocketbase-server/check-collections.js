import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8091');

try {
  const collections = await pb.collections.getFullList();
  console.log('Available collections:');
  collections.forEach(c => {
    console.log(`  - ${c.name} (type: ${c.type})`);
  });
} catch (error) {
  console.log('❌ Error:', error.message);
}
