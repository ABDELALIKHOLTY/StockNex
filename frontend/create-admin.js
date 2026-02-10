/**
 * Script to create an admin user
 * Usage: node create-admin.js
 */

const API_URL = 'http://localhost:4000';

async function createAdmin() {
  try {
    const response = await fetch(`${API_URL}/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin2@stocknex.com',
        username: 'admin2',
        password: 'admin123',
        adminSecret: 'admin123'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error || data.message);
      return;
    }

    console.log('✅ Admin created successfully!');
    console.log('\n📋 Information:');
    console.log(`  Email: ${data.user.email}`);
    console.log(`  Username: ${data.user.username}`);
    console.log(`  Admin: ${data.user.isAdmin}`);
    console.log(`\n🔑 Token (save this token):`);
    console.log(`  ${data.token}`);
    console.log('\n📝 Use this token in localStorage as the access token');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('   Make sure the backend is running on http://localhost:4000');
  }
}

createAdmin();
