#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [dir] = process.argv.slice(2);
if (!dir) {
  console.error('Usage: node scripts/run-sql.js <folder>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const folder = path.resolve(__dirname, '..', dir);
const files = fs
  .readdirSync(folder)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const run = async () => {
  for (const file of files) {
    const sql = fs.readFileSync(path.join(folder, file), 'utf8');
    console.log(`Running ${file}`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(error);
      process.exit(1);
    }
  }
  console.log('Done');
};

run();
