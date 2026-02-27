
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3001/api/products?limit=5');
    const data = await response.json();
    console.log('Product Images:', data.data.map(p => p.product_image));
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

fetchProducts();
