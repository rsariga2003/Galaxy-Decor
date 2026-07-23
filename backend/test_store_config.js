const { supabase } = require('./database');

async function testStoreConfig() {
  console.log("Testing store_config upsert...");
  const sampleStore = {
    phone: "6384139796",
    email: "galaxydecorind@gmail.com",
    hours: "9 to 5",
    address: "4/642, Post Office Building, Sakthi Nagar, Opposite Viswanathan Hospital, Vijayamangalam, Perundurai, Erode - 638056."
  };

  const rowsToUpsert = Object.entries(sampleStore).map(([key, value]) => ({
    key,
    value: String(value)
  }));

  const { data, error } = await supabase.from('store_config').upsert(rowsToUpsert).select();
  if (error) {
    console.error("Upsert Error:", error);
  } else {
    console.log("Upsert Success! Rows inserted/updated:", data);
  }

  const { data: readData, error: readErr } = await supabase.from('store_config').select('*');
  console.log("Read back store_config:", readData, readErr);
}

testStoreConfig();
