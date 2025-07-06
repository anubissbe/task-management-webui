const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('Testing bcrypt...');
  
  try {
    // Test 1: Compare with known hash
    const testPassword = 'admin123';
    const testHash = '$2a$10$ILQeDcYjXZBPJDIAiA.PnOgs1rqZaYecV5dVLmjKdoFViZGX1W1.W';
    
    console.log('Test 1: Compare with existing hash');
    const result1 = await bcrypt.compare(testPassword, testHash);
    console.log('Result:', result1);
    
    // Test 2: Generate new hash
    console.log('\nTest 2: Generate new hash');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash:', newHash);
    
    // Test 3: Verify new hash
    console.log('\nTest 3: Verify new hash');
    const result2 = await bcrypt.compare(testPassword, newHash);
    console.log('Result:', result2);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt();