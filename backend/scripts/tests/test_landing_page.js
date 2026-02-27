const testLandingPageLogic = async () => {
  console.log('\n=== Simulating Landing Page Data Fetch ===\n');
  
  try {
    // Test products fetch
    console.log('1. Fetching products...');
    const productsRes = await fetch('http://localhost:3001/api/products?limit=10');
    const productsData = await productsRes.json();
    
    // Simulate the new logic
    const productsList = productsData.data || productsData.products || productsData || [];
    const products = Array.isArray(productsList) ? productsList : [];
    
    console.log(`   ✅ Products loaded: ${products.length} items`);
    if (products.length > 0) {
      console.log(`   Sample product: "${products[0].product_name}" - ${products[0].price} VND`);
      console.log(`   Product has image: ${!!products[0].product_image}`);
    }
    
    // Test posts fetch
    console.log('\n2. Fetching posts...');
    const postsRes = await fetch('http://localhost:3001/api/posts?status=PUBLISHED&limit=3');
    const posts = await postsRes.json();
    
    console.log(`   ✅ Posts loaded: ${posts.length} items`);
    if (posts.length > 0) {
      console.log(`   Sample post: "${posts[0].title}"`);
    }
    
    console.log('\n🎉 Landing page should now display:');
    console.log(`   - ${products.length} products in carousel`);
    console.log(`   - ${posts.length} blog posts`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testLandingPageLogic();
