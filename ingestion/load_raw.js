/**
 * load_raw.js
 * -----------
 * Reads all CSV files from the ../data/ folder and loads each into the
 * `raw` schema in Postgres. Table names are derived from the CSV filename
 * converted to snake_case.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const { Pool } = require('pg');
const { parse } = require('csv-parse');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const SAMPLE_SIZE = 100; // rows to sample for type inference

function toSnakeCase(str) {
    return path.parse(str).name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

function inferType(values) {
    let hasString = false;
    let hasFloat = false;
    let hasInt = false;
    let hasDate = false;

    for (const val of values) {
        if (!val || val === '') continue;
        
        if (!isNaN(val)) {
            if (val.includes('.')) hasFloat = true;
            else hasInt = true;
        } else if (!isNaN(Date.parse(val)) && val.length > 10) {
            hasDate = true;
        } else {
            hasString = true;
        }
    }

    if (hasString) return 'TEXT';
    if (hasDate) return 'TIMESTAMP';
    if (hasFloat) return 'DOUBLE PRECISION';
    if (hasInt) return 'BIGINT';
    return 'TEXT';
}

async function loadCsv(filePath) {
    const fileName = path.basename(filePath);
    const tableName = toSnakeCase(fileName);
    console.log(`Processing ${fileName} -> raw.${tableName}...`);

    return new Promise((resolve, reject) => {
        const rows = [];
        let headers = [];
        let types = [];
        
        const parser = fs.createReadStream(filePath).pipe(
            parse({
                columns: true,
                skip_empty_lines: true
            })
        );

        parser.on('data', (record) => {
            if (headers.length === 0) {
                headers = Object.keys(record);
            }
            rows.push(record);
        });

        parser.on('error', (err) => reject(err));

        parser.on('end', async () => {
            if (rows.length === 0) {
                console.log(`Skipped ${fileName} (empty)`);
                return resolve();
            }

            // Sample rows to infer types
            const sampleRows = rows.slice(0, SAMPLE_SIZE);
            types = headers.map(header => {
                const values = sampleRows.map(row => row[header]);
                return inferType(values);
            });

            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                // Create table
                const columnsDdl = headers.map((header, i) => `"${header}" ${types[i]}`).join(', ');
                await client.query(`DROP TABLE IF EXISTS raw.${tableName}`);
                await client.query(`CREATE TABLE raw.${tableName} (${columnsDdl})`);

                // Insert data (batched)
                const batchSize = 1000;
                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    const placeholders = [];
                    const values = [];
                    
                    let paramIdx = 1;
                    for (const row of batch) {
                        const rowPlaceholders = [];
                        for (const header of headers) {
                            rowPlaceholders.push(`$${paramIdx++}`);
                            values.push(row[header] === '' ? null : row[header]);
                        }
                        placeholders.push(`(${rowPlaceholders.join(', ')})`);
                    }
                    
                    const query = `INSERT INTO raw.${tableName} ("${headers.join('", "')}") VALUES ${placeholders.join(', ')}`;
                    await client.query(query, values);
                }

                await client.query('COMMIT');
                console.log(`Loaded raw.${tableName} (${rows.length} rows)`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Error loading ${tableName}:`, err);
                reject(err);
            } finally {
                client.release();
                resolve();
            }
        });
    });
}

async function main() {
    try {
        await pool.query('CREATE SCHEMA IF NOT EXISTS raw;');
        
        if (!fs.existsSync(DATA_DIR)) {
            console.log(`Data directory not found: ${DATA_DIR}`);
            return;
        }

        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
        if (files.length === 0) {
            console.log(`No CSV files found in ${DATA_DIR}`);
            return;
        }

        console.log(`Found ${files.length} CSV files.`);
        
        for (const file of files) {
            await loadCsv(path.join(DATA_DIR, file));
        }
        
        console.log('✓ All files loaded successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

main();
