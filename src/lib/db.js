/**
 * db.js
 *
 * Creates and exports the Neon database connection
 * The neon function returns a tagged template literal query client
 * meaning queries are written as sql`SELECT * FROM table` instead of sql.query()
 * The connection string is pulled from the POSTGRES_URL environment variable
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL);

export default sql;