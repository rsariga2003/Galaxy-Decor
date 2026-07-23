/**
 * GALAXY DECOR - SUPABASE CONNECTION TESTER
 * Run with: node test_supabase.js
 */

require('dotenv').config();
const { supabase, isConfigured } = require('./database');

async function testConnection() {
  console.log('\n======================================');
  console.log('🌌 GALAXY DECOR - Testing Supabase Connection');
  console.log('======================================\n');

  if (!isConfigured) {
    console.error('❌ Connection Failed: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are still using placeholder dummy values in backend/.env.');
    console.log('👉 Please update backend/.env with your real Supabase keys from https://supabase.com/dashboard');
    process.exit(1);
  }

  console.log(`🔗 Target URL: ${process.env.SUPABASE_URL}`);
  console.log('⏳ Connecting to Supabase Cloud PostgreSQL...\n');

  try {
    // Test query on 'store_config' table
    const { data: storeData, error: storeError } = await supabase.from('store_config').select('*').limit(5);

    if (storeError) {
      const isMissingTable = storeError.code === '42P01' || 
                             storeError.code === 'PGRST204' || 
                             storeError.message.includes('store_config') ||
                             storeError.message.includes('relation');
      
      if (isMissingTable) {
        console.log('🎉 CONNECTED TO SUPABASE SUCCESSFULLY! (Authentication & Connection verified ✅)');
        console.log('\n⚠️  Status: Database tables have not been created yet in your Supabase project.');
        console.log('\n📋 Quick Step to Create Tables:');
        console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Click "SQL Editor" in the left sidebar');
        console.log('3. Open file: backend/schema.sql, copy all lines, paste into SQL Editor, and click "Run"');
        console.log('4. Once created, run `node seed_supabase.js` to automatically populate all products & categories!\n');
        console.log('======================================\n');
        process.exit(0);
      } else {
        throw storeError;
      }
    }

    // Check products table
    const { data: productsData, error: prodError } = await supabase.from('products').select('id, name').limit(5);

    console.log('✅ SUCCESS! SUPABASE CONNECTION IS FULLY WORKING! 🎉\n');
    console.log(`📊 Connection Summary:`);
    console.log(`   - Config records found: ${storeData ? storeData.length : 0}`);
    console.log(`   - Product records found: ${productsData ? productsData.length : 0}`);

    if (productsData && productsData.length > 0) {
      console.log('\n📦 Sample products from database:');
      productsData.forEach(p => console.log(`   • [${p.id}] ${p.name}`));
    } else {
      console.log('\n💡 Database tables exist! If you want to populate sample data into Supabase, you can run the seeder script: node seed_supabase.js');
    }
    console.log('\n======================================\n');

  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
    console.log('\n💡 Troubleshooting Checklist:');
    console.log('1. Check if SUPABASE_URL starts with https://');
    console.log('2. Verify SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in Project Settings -> API');
    console.log('3. Ensure your internet connection is active\n');
  }
}

testConnection();
