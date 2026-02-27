
async function test() {
  const baseUrl = 'http://localhost:3001/api/reviews';
  
  // 1. Get initial reviews
  console.log('1. Fetching reviews...');
  const res1 = await fetch(baseUrl);
  const reviews1 = await res1.json();
  console.log(`initial count: ${reviews1.length}`);

  // Need a product ID to create a review. fetch products first
  const prodRes = await fetch('http://localhost:3001/api/products?limit=1');
  const prodData = await prodRes.json();
  const productId = prodData.data[0].product_id;
  console.log('Using product ID:', productId);

  // 2. Create review
  console.log('2. Creating review...');
  const newReview = {
    product_id: productId,
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    rating: 5,
    title: 'Test Review',
    content: 'This is a test review created via script.'
  };
  
  const res2 = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newReview)
  });
  const createdReview = await res2.json();
  console.log('Created review:', createdReview.id);

  // 3. Update review status
  console.log('3. Approving review...');
  const res3 = await fetch(`${baseUrl}/${createdReview.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' })
  });
  const updatedReview = await res3.json();
  console.log('Updated status:', updatedReview.status);

  // 4. Delete review
  console.log('4. Deleting review...');
  const res4 = await fetch(`${baseUrl}/${createdReview.id}`, { method: 'DELETE' });
  console.log('Delete status:', res4.status);

  // 5. Verify deletion
  const res5 = await fetch(baseUrl);
  const reviews5 = await res5.json();
  const found = reviews5.find(r => r.id === createdReview.id);
  console.log('Review found after delete:', !!found);
}

test().catch(console.error);
