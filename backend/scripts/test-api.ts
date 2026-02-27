async function checkApi() {
    try {
        const url = 'http://localhost:3001/api/products?category=electric-system';
        console.log(`Fetching: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const json = await response.json();
        console.log(`Total Products in 'electric-system': ${json.metadata.total}`);

        if (json.data && json.data.length > 0) {
            console.log('Sample Products:');
            json.data.forEach((p: any) => {
                console.log(`- ${p.product_name} (Category: ${p.category}, Sub: ${p.sub_category})`);
            });
        } else {
            console.log('No products found! Server update might not be applied.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

checkApi();
