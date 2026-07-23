/**
 * GALAXY DECOR - SUPABASE SEEDER SCRIPT
 * Uploads all products, categories, store config, interior solutions, and reviews into Supabase.
 * Run with: node seed_supabase.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('./database');

async function seedSupabase() {
  console.log('\n======================================');
  console.log('🌌 GALAXY DECOR - Seeding Supabase Database');
  console.log('======================================\n');

  if (!isConfigured) {
    console.error('❌ Cannot Seed: Supabase credentials are missing in backend/.env');
    process.exit(1);
  }

  try {
    const dataPath = path.resolve(__dirname, '../js/data.js');
    let dataContent = fs.readFileSync(dataPath, 'utf-8');
    dataContent = dataContent.replace('window.GALAXY_DECOR_DB = ', 'return ');
    const getDbData = new Function(dataContent);
    const initialData = getDbData();

    // 1. Seed Store Config
    if (initialData.store) {
      console.log('⏳ Seeding store config...');
      const storeRows = Object.entries(initialData.store).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('store_config').upsert(storeRows);
      if (error) throw new Error(`Store Config Seed Error: ${error.message}`);
      console.log(`✅ Store config seeded (${storeRows.length} keys)`);
    }

    // 2. Seed Categories
    if (initialData.categories) {
      console.log('⏳ Seeding categories...');
      const { error } = await supabase.from('categories').upsert(initialData.categories);
      if (error) throw new Error(`Categories Seed Error: ${error.message}`);
      console.log(`✅ Categories seeded (${initialData.categories.length} categories)`);
    }

    // 3. Seed Products
    if (initialData.products) {
      console.log('⏳ Seeding products...');
      const productRecords = initialData.products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        shortDesc: p.shortDesc,
        desc: p.desc,
        price: p.price,
        offerPrice: p.offerPrice || 0,
        image: p.image,
        gallery: p.gallery || [],
        isNew: Boolean(p.isNew),
        inStock: Boolean(p.inStock),
        specs: p.specs || {}
      }));
      const { error } = await supabase.from('products').upsert(productRecords);
      if (error) throw new Error(`Products Seed Error: ${error.message}`);
      console.log(`✅ Products seeded (${productRecords.length} items)`);
    }

    // 4. Seed Interior Solutions
    if (initialData.interiorSolutions) {
      console.log('⏳ Seeding interior solutions...');
      const { error } = await supabase.from('interior_solutions').upsert(initialData.interiorSolutions);
      if (error) throw new Error(`Solutions Seed Error: ${error.message}`);
      console.log(`✅ Interior solutions seeded (${initialData.interiorSolutions.length} solutions)`);
    }

    // 5. Seed Reviews
    if (initialData.reviews) {
      console.log('⏳ Seeding customer reviews...');
      const { error } = await supabase.from('reviews').upsert(initialData.reviews);
      if (error) throw new Error(`Reviews Seed Error: ${error.message}`);
      console.log(`✅ Reviews seeded (${initialData.reviews.length} reviews)`);
    }

    console.log('\n🎉 ALL STORE DATA SEEDED TO SUPABASE SUCCESSFULLY!\n');
    console.log('======================================\n');

  } catch (err) {
    console.error('\n❌ Seeding Error:', err.message);
    console.log('💡 Note: Make sure you have created the database tables first by running backend/schema.sql in Supabase SQL Editor.\n');
  }
}

seedSupabase();
