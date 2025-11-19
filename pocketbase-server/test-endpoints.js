const endpoints = [
  '/api/admins/auth-with-password',
  '/api/admin/auth-with-password',
  '/api/auth/admins/auth-with-password',
  '/admins/auth-with-password',
];

for (const endpoint of endpoints) {
  try {
    const response = await fetch('https://mantente-pocketbase.fly.dev' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'mantenteapp@gmail.com', password: '31671702' })
    });
    const data = await response.json();
    console.log(`${endpoint}: ${response.status}`, data.message || data);
  } catch (error) {
    console.log(`${endpoint}: ERROR -`, error.message);
  }
}
