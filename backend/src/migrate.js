require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
    if (rows.length) {
      console.log(`skip ${file} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`applying ${file}...`);
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`applied ${file}`);
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }

  await pool.end();
  console.log('done');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
