require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: p } = await s.from('products').select('*').ilike('title', '%Melts Pizza%');
  const user_id = p[0].partner_id;

  const res = await s.from('orders').insert({
    user_id: user_id,
    product_id: p[0].id,
    quantity: 1,
    total_price: 5000,
    pickup_code: 'TEST02',
    status: 'pending'
  });
  
  fs.writeFileSync('output.txt', JSON.stringify(res, null, 2), 'utf8');
}
main();
