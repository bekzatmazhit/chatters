import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aaxluhafznsskgfeixkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Rw0y9Plr6Yf2KuBmo7A-5g_yAc1TXAk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: brands, error: bErr } = await supabase.from('brands').select('id').limit(1);
  if (bErr || !brands || brands.length === 0) {
    console.log("No brands found", bErr);
    return;
  }
  const brandId = brands[0].id;
  
  const content = fs.readFileSync('b2b_ai_visibility_data.csv', 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  
  const records = [];
  for(let i = 1; i < lines.length; i++) {
    // To handle commas in the text snippet (the last column):
    const parts = lines[i].split(',');
    if (parts.length < 10) continue;
    
    const cols = parts.slice(0, 9);
    let snippet = parts.slice(9).join(',');
    // If snippet is wrapped in quotes, strip them
    if (snippet.startsWith('"') && snippet.endsWith('"')) {
        snippet = snippet.slice(1, -1);
    }
    cols.push(snippet);
    
    // created_at,query,model,brand_mentioned,competitor_mentioned,position,sentiment_score,citations,is_hallucination,text_snippet
    let position = parseInt(cols[5]);
    if (isNaN(position)) position = null;
    
    let citations = cols[7] ? cols[7].split(';') : [];
    if (citations.length === 1 && citations[0] === '') citations = [];
    
    let sent = parseFloat(cols[6]);
    if (isNaN(sent)) sent = 0;
    
    records.push({
      brand_id: brandId,
      created_at: new Date(cols[0]).toISOString(),
      query: cols[1],
      model: cols[2],
      brand_mentioned: cols[3].trim().toLowerCase() === 'true',
      competitor_mentioned: cols[4].trim().toLowerCase() === 'true',
      position: position,
      sentiment_score: sent,
      citations: citations,
      is_hallucination: cols[8].trim().toLowerCase() === 'true',
      hallucination_score: cols[8].trim().toLowerCase() === 'true' ? 5 : 0,
      text_snippet: cols[9]
    });
  }
  
  // Clear old logs
  console.log("Clearing old logs for brand:", brandId);
  const { error: delErr } = await supabase.from('ai_visibility_logs').delete().eq('brand_id', brandId);
  if (delErr) {
     console.error("Delete error", delErr);
  }
  
  // Insert in chunks
  console.log(`Inserting ${records.length} records...`);
  for(let i = 0; i < records.length; i += 100) {
    const chunk = records.slice(i, i + 100);
    const { error } = await supabase.from('ai_visibility_logs').insert(chunk);
    if (error) {
       console.log("Insert error at chunk", i, error);
    }
  }
  console.log(`Done!`);
}

run();
