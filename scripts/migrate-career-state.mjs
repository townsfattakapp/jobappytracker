import { confirmDevelopmentDatabase, loadDevelopmentDatabaseEnv } from './lib/development-database.mjs';
loadDevelopmentDatabaseEnv();
confirmDevelopmentDatabase(process.env, process.argv.slice(2));
import pg from 'pg';import {readFileSync} from 'node:fs'; const p=new pg.Pool({connectionString:process.env.DATABASE_URL});
try {const before=await p.query('SELECT (SELECT count(*) FROM goals) AS goals, (SELECT count(*) FROM study_tasks) AS tasks, (SELECT count(*) FROM prep_notes) AS notes');console.log('Existing row counts:',before.rows); await p.query(readFileSync('src/lib/db/migrations/0001_career_state.sql','utf8')); console.log('Additive career_state migration applied');} finally {await p.end()}
