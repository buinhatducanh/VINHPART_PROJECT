
async function testLatency() {
    const start = performance.now();
    try {
        const res = await fetch('http://localhost:3001/api/products');
        const end = performance.now();
        console.log(`Status: ${res.status}`);
        console.log(`Time: ${(end - start).toFixed(2)}ms`);
        const data = await res.json();
        console.log(`Products: ${data.length}`);
        if (data.length > 0) {
            console.log('Sample product:', JSON.stringify(data[0], null, 2));
            const payloadSize = JSON.stringify(data).length;
            console.log(`Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testLatency();
