
async function testProxyLogin() {
    try {
        console.log('Testing Login via PROXY at http://localhost:5173/api/auth/login');
        const response = await fetch('http://localhost:5173/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@vinhpart.vn',
                password: 'admin123'
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        // Clone response to read text if JSON fails
        const text = await response.text();
        console.log('Response Body:', text);

        try {
            const data = JSON.parse(text);
            console.log('Parsed JSON:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response is not JSON');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testProxyLogin();
