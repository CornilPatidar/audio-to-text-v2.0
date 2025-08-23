const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query to see if tables exist
    const userCount = await prisma.user.count();
    const transcriptionCount = await prisma.transcription.count();
    
    console.log(`📊 Database stats:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Transcriptions: ${transcriptionCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { prisma, testConnection };
