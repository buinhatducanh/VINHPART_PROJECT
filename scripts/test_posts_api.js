const fetchPosts = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/posts?status=PUBLISHED&limit=3');
    const posts = await response.json();
    
    console.log(`\n✅ API Response - Found ${posts.length} PUBLISHED posts:\n`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   - Slug: ${post.slug}`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Published: ${post.publishedAt}`);
      console.log(`   - Views: ${post.viewCount}\n`);
    });
    
    if (posts.length === 0) {
      console.log('⚠️ No published posts found!');
    } else {
      console.log(`🎉 Landing page will now show these ${posts.length} posts!`);
    }
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message);
  }
};

fetchPosts();
