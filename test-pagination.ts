
import assert from 'assert';

async function testPagination() {
    console.log("Testing Pagination...");

    // 1. Default Page 1 (Limit 12)
    const res1 = await fetch('http://localhost:3001/api/products');
    const data1 = await res1.json();
    console.log(`Default request status: ${res1.status}`);
    assert.strictEqual(res1.status, 200);
    assert.ok(data1.data, "Response should have 'data' property");
    assert.ok(data1.metadata, "Response should have 'metadata' property");
    // Limit is 12 default
    assert.ok(data1.data.length <= 12, "Should return at most 12 items");
    console.log(`Page 1 items: ${data1.data.length}`);
    console.log(`Metadata:`, data1.metadata);

    // 2. Page 2
    if (data1.metadata.totalPages > 1) {
        const res2 = await fetch('http://localhost:3001/api/products?page=2&limit=12');
        const data2 = await res2.json();
        console.log(`Page 2 items: ${data2.data.length}`);
        assert.ok(data2.data.length > 0, "Page 2 should have items (if total > 12)");
        assert.notDeepStrictEqual(data1.data[0], data2.data[0], "Page 1 and 2 should have different items");
    }

    // 3. Search Filter
    // Find a name from page 1 to search for
    if (data1.data.length > 0) {
        const productToFind = data1.data[0];
        const searchName = productToFind.product_name.split(' ')[0]; // First word
        console.log(`Testing search for: ${searchName}`);

        const resSearch = await fetch(`http://localhost:3001/api/products?search=${searchName}`);
        const dataSearch = await resSearch.json();
        console.log(`Search results: ${dataSearch.data.length}`);
        assert.ok(dataSearch.data.length > 0, "Search should return results");
        assert.ok(dataSearch.data.every((p: any) => p.product_name.toLowerCase().includes(searchName.toLowerCase())), "All results should match search");
    }

    // 4. Latency Check (Small payload)
    const start = performance.now();
    await fetch('http://localhost:3001/api/products?limit=12');
    const end = performance.now();
    console.log(`Latency for 12 items: ${(end - start).toFixed(2)}ms`);

    console.log("Validation Successful!");
}

testPagination().catch(console.error);
