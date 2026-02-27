const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/products?limit=10');
    const data = await response.json();
    
    console.log('\n=== Products API Test ===\n');
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Has products property:', 'products' in data);
    console.log('Has data property:', 'data' in data);
    
    if (Array.isArray(data)) {
      console.log(`\n✅ Direct array - ${data.length} products`);
      data.slice(0, 3).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.price} VND`);
      });
    } else if (data.products) {
      console.log(`\n✅ Has products property - ${data.products.length} products`);
      data.products.slice(0, 3).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.price} VND`);
      });
    } else if (data.data) {
      console.log(`\n✅ Has data property - ${data.data.length} products`);
      data.data.slice(0, 3).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.price} VND`);
      });
    } else {
      console.log('\n⚠️ Unknown data structure:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
  }
};

fetchProducts();
