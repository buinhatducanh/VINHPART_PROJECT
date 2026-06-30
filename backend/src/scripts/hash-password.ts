import bcrypt from 'bcrypt';

async function hashPassword() {
  const password = 'admin123';
  const saltRounds = 10;
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('🔑 Password:', password);
  console.log('🔐 Hashed password:', hash);
  console.log('\n📝 Copy this hash into your SQL:');
  console.log(hash);
}

hashPassword();