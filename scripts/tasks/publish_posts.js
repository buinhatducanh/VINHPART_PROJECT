import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function publishPosts() {
  try {
    // Get all draft posts
    const drafts = await pool.query(`
      SELECT id, title, status 
      FROM posts 
      WHERE status = 'DRAFT'
    `);
    
    console.log(`Found ${drafts.rows.length} draft posts:`);
    drafts.rows.forEach(post => {
      console.log(`  - ${post.title} (${post.id})`);
    });
    
    if (drafts.rows.length === 0) {
      console.log('No draft posts to publish.');
      return;
    }
    
    // Update all draft posts to PUBLISHED
    const result = await pool.query(`
      UPDATE posts 
      SET status = 'PUBLISHED', 
          "publishedAt" = CURRENT_TIMESTAMP,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE status = 'DRAFT'
      RETURNING id, title, status
    `);
    
    console.log(`\n✅ Successfully published ${result.rows.length} posts:`);
    result.rows.forEach(post => {
      console.log(`  - ${post.title} is now ${post.status}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pool.end();
  }
}

publishPosts();
