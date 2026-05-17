const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.POSTGRES_URL);

async function migrate() {
  console.log('Connecting to database...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        settings      JSONB NOT NULL DEFAULT '{}'
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        color      TEXT NOT NULL DEFAULT '#7c6af7',
        icon       TEXT NOT NULL DEFAULT '📋',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        archived   BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS lists (
        id         TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        position   INTEGER NOT NULL DEFAULT 0
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id           TEXT PRIMARY KEY,
        list_id      TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        project_id   TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title        TEXT NOT NULL,
        description  TEXT NOT NULL DEFAULT '',
        due_date     TIMESTAMPTZ,
        priority     TEXT NOT NULL DEFAULT 'normal',
        completed    BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        position     INTEGER NOT NULL DEFAULT 0,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id      TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name    TEXT NOT NULL,
        color   TEXT NOT NULL DEFAULT '#7c6af7'
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id         TEXT PRIMARY KEY,
        task_id    TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ Database tables created successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

migrate();