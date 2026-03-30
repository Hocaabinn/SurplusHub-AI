require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + 'rest/v1/';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url, { headers: { apikey: key } });
  const text = await res.text();
  fs.writeFileSync('openapi.json', text, 'utf8');
}
main();
