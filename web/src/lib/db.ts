import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export function isReadonlyDbRuntime(): boolean {
    return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

export async function getDb(): Promise<Database> {
    if (db) return db;
    
    // DB is at web/jobs.db, but process.cwd() is web/ root usually
    const dbPath = path.resolve(process.cwd(), 'jobs.db');
    
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
        // Vercel serverless functions run on a read-only filesystem.
        mode: isReadonlyDbRuntime()
          ? sqlite3.OPEN_READONLY
          : sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    });
    
    return db;
}

export interface Job {
    id: number;
    organization: string;
    title: string;
    posts: string;
    deadline: string;
    url: string;
    content_html: string;
    full_description: string;
    title_fr: string;
    organization_fr: string;
    meta_description?: string | null;
    telegram_post?: string | null;
    created_at: string;
}
