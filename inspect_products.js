
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3001/api/products?limit=5');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

fetchProducts();
