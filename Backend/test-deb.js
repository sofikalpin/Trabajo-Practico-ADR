const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://user_1:Sofia4533@cluster0.nesg8rs.mongodb.net/inmobiliaria?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    console.log(collections.map(c => `- ${c.name}`).join('\n'));
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    
    if (error.message.includes('bad auth')) {
      console.log('⚠️  Authentication failed. Please check your username and password.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️  Could not connect to the server. Check your network connection and MongoDB server status.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('⚠️  Could not resolve the hostname. Check your connection string.');
    } else {
      console.log('⚠️  Unknown error. Please check your MongoDB connection string and network settings.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Connection closed.');
    }
    process.exit(0);
  }
}

testConnection();