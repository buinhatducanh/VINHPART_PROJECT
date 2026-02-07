
async function testCaseSensitivity() {
    try {
        console.log('Testing Login with Uppercase Email at http://localhost:3001/api/auth/login');
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'Admin@vinhpart.vn', // Mixed case
                password: 'admin123'
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testCaseSensitivity();
