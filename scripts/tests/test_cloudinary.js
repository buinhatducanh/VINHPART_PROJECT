const testCloudinaryImages = async () => {
  try {
    console.log('\n=== Testing Cloudinary Images ===\n');
    
    // Fetch some products to check image URLs
    const response = await fetch('http://localhost:3001/api/products?limit=5');
    const data = await response.json();
    const products = data.data || [];
    
    console.log(`Found ${products.length} products\n`);
    
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      console.log(`${i + 1}. ${product.product_name}`);
      console.log(`   Image URL: ${product.product_image || 'NO IMAGE'}`);
      
      if (product.product_image) {
        // Try to fetch the image
        try {
          const imgResponse = await fetch(product.product_image, { method: 'HEAD' });
          console.log(`   Status: ${imgResponse.status} ${imgResponse.statusText}`);
          console.log(`   Content-Type: ${imgResponse.headers.get('content-type')}`);
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testCloudinaryImages();
