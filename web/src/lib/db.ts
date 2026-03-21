import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
    if (db) return db;
    
    // DB is at web/jobs.db, but process.cwd() is web/ root usually
    const dbPath = path.resolve(process.cwd(), 'jobs.db');
    
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
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
    created_at: string;
}
