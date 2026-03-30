require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: p } = await s.from('products').select('*').ilike('title', '%Melts Pizza%');
  let result = "Product:\n" + JSON.stringify(p, null, 2) + "\n\n";

  if (p && p.length > 0) {
    const { data: o } = await s.from('orders').select('*');
    result += "All Orders:\n" + JSON.stringify(o, null, 2) + "\n\n";
  }

  // Find the exact trigger text by simulating passing a very large quantity to get the trigger exception
  const { error } = await s.from('orders').insert({
    user_id: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.split('.')[0], // Invalid UUID to see what fails first, maybe UUID?
    product_id: p[0].id,
    quantity: 100,
    pickup_code: 'TEST01',
    status: 'pending'
  });
  result += "Error for big quantity:\n" + JSON.stringify(error, null, 2);

  // But I really need to read pg_proc! Wait, what if I fetch all products and see what stock_quantity is?
  fs.writeFileSync('output.txt', result, 'utf8');
}
main();
