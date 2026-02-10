const analyzePerformance = async () => {
  console.log('=== PERFORMANCE ANALYSIS ===\n');
  
  // Test API response times
  console.log('1. API Response Times:');
  const apis = [
    { name: 'Products API', url: 'http://localhost:3001/api/products?limit=10' },
    { name: 'Posts API', url: 'http://localhost:3001/api/posts?status=PUBLISHED' },
  ];
  
  for (const api of apis) {
    const start = Date.now();
    try {
      const res = await fetch(api.url);
      const data = await res.json();
      const duration = Date.now() - start;
      
      const itemCount = data.data?.length || data.length || 0;
      const size = JSON.stringify(data).length;
      
      console.log(`\n   ${api.name}:`);
      console.log(`   ⏱️  Response time: ${duration}ms`);
      console.log(`   📦 Response size: ${(size / 1024).toFixed(2)} KB`);
      console.log(`   📊 Items count: ${itemCount}`);
      
      if (duration > 500) {
        console.log(`   ⚠️  WARNING: Slow response (> 500ms)`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Check for large images
  console.log('\n\n2. Image Analysis:');
  try {
    const res = await fetch('http://localhost:3001/api/products?limit=5');
    const data = await res.json();
    const products = data.data || data || [];
    
    console.log(`   Checking ${products.length} product images...`);
    
    for (const product of products) {
      if (product.product_image) {
        const url = product.product_image;
        console.log(`\n   Product: ${product.product_name}`);
        console.log(`   Image URL: ${url}`);
        
        // Check if URL has optimization params
        const hasOptimization = url.includes('q_auto') || url.includes('f_auto') || url.includes('w_');
        console.log(`   Optimized: ${hasOptimization ? '✅ Yes' : '❌ No - Needs optimization'}`);
        
        if (!hasOptimization) {
          const optimizedUrl = url.replace('/upload/', '/upload/q_auto,f_auto,w_500/');
          console.log(`   Suggested: ${optimizedUrl}`);
        }
      }
    }
  } catch (error) {
    console.log(`   Error checking images: ${error.message}`);
  }
  
  console.log('\n\n3. Development vs Production:');
  console.log('   Current mode: DEVELOPMENT (npm run dev)');
  console.log('   ⚠️  Dev mode loads hundreds of unbundled JS files');
  console.log('   ⚠️  No minification, no tree-shaking');
  console.log('   ⚠️  Source maps and debug code included');
  console.log('\n   Recommendation: Test with production build (npm run build)');
  
  console.log('\n\n4. Common Issues Checklist:');
  console.log('   📌 Large unoptimized images from Cloudinary');
  console.log('   📌 Dev mode with no bundling/minification'); 
  console.log('   📌 Slow API responses (database queries)');
  console.log('   📌 Loading too much data at once (no pagination)');
  console.log('   📌 No lazy loading for images');
  
  console.log('\n=== ANALYSIS COMPLETE ===');
};

analyzePerformance();
