/**
 * Does this candidate already exist in the leads table?
 *
 * Shared by both agents so neither spends a research pass on somebody we
 * have already pitched. Matching is deliberately loose - a lead can come
 * back under a slightly different trade name, or with the landline this
 * time and the mobile last time - so it checks three independent keys and
 * reports which one fired.
 *
 *   node scripts/check-duplicates.mjs candidates.csv
 *   node scripts/check-duplicates.mjs candidates.json
 *
 * Input needs a name, and a phone or an email. CSV headers are read
 * loosely: "Clinic Name" / "Studio Name" / "Business Name" / "name" all
 * work, same for Phone / Email.
 *
 * Reads only. It never writes to the database.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

/** Last ten digits, so +91 / 0 / spacing differences collapse together. */
function localPhone(raw) {
  let n = digitsOnly(raw);
  if (n.startsWith('91') && n.length > 10) n = n.slice(-10);
  return n.length >= 10 ? n.slice(-10) : '';
}

/**
 * Trade-name noise removed, so "Shah Interiors" and "Shah Interior
 * Designers Pvt Ltd" land on the same key.
 */
function nameKey(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/\b(dr|drs|the|and|&|pvt|private|ltd|limited|llp|co|company|clinic|hospital|centre|center|care|studio|studios|design|designs|designer|designers|interior|interiors|architect|architects|associates|consultants?)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const emailKey = (s) => String(s || '').trim().toLowerCase();

/* --- minimal CSV reader: quoted fields may contain commas --- */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const pick = (obj, ...keys) => {
  for (const k of Object.keys(obj)) {
    if (keys.some((want) => k.trim().toLowerCase() === want)) {
      const v = String(obj[k] ?? '').trim();
      if (v) return v;
    }
  }
  return '';
};

function loadCandidates(file) {
  const raw = fs.readFileSync(file, 'utf8');
  let records;
  if (path.extname(file).toLowerCase() === '.json') {
    const parsed = JSON.parse(raw);
    records = Array.isArray(parsed) ? parsed : parsed.leads || [];
  } else {
    const rows = parseCsv(raw);
    const head = rows[0].map((h) => h.trim());
    records = rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
  }
  return records.map((r) => ({
    name: pick(r, 'clinic name', 'studio name', 'business name', 'name', 'title'),
    phone: pick(r, 'phone', 'phone number', 'contact', 'mobile'),
    email: pick(r, 'email', 'email address', 'public email'),
  })).filter((r) => r.name);
}

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return null;
  const m = fs.readFileSync(envPath, 'utf8').match(/^DATABASE_URL=(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node scripts/check-duplicates.mjs <candidates.csv|.json>');
    process.exit(2);
  }

  const candidates = loadCandidates(file);
  if (!candidates.length) {
    console.error('no readable rows in ' + file + ' (need a name column, plus phone or email)');
    process.exit(2);
  }

  const url = readDatabaseUrl();
  if (!url) { console.error('DATABASE_URL not set and no .env found'); process.exit(2); }

  const pool = new pg.Pool({ connectionString: url });
  const { rows } = await pool.query('SELECT clinicname, phone, whatsapp, email FROM leads');
  await pool.end();

  const byPhone = new Map(), byEmail = new Map(), byName = new Map();
  for (const r of rows) {
    for (const p of [r.phone, r.whatsapp]) {
      const k = localPhone(p);
      if (k) byPhone.set(k, r.clinicname);
    }
    const e = emailKey(r.email);
    if (e) byEmail.set(e, r.clinicname);
    const n = nameKey(r.clinicname);
    if (n) byName.set(n, r.clinicname);
  }

  const fresh = [], seen = [];
  const withinFile = new Map();

  for (const c of candidates) {
    const hits = [];
    const p = localPhone(c.phone), e = emailKey(c.email), n = nameKey(c.name);
    if (p && byPhone.has(p)) hits.push(`phone matches "${byPhone.get(p)}"`);
    if (e && byEmail.has(e)) hits.push(`email matches "${byEmail.get(e)}"`);
    if (n && byName.has(n)) hits.push(`name matches "${byName.get(n)}"`);

    const selfKey = p || e || n;
    if (selfKey && withinFile.has(selfKey)) hits.push(`duplicate of "${withinFile.get(selfKey)}" in this same file`);
    else if (selfKey) withinFile.set(selfKey, c.name);

    (hits.length ? seen : fresh).push({ ...c, hits });
  }

  console.log(`database rows: ${rows.length}  |  candidates: ${candidates.length}\n`);

  if (seen.length) {
    console.log(`ALREADY HAVE (${seen.length}) - do not research these:`);
    for (const s of seen) console.log(`  - ${s.name}\n      ${s.hits.join('; ')}`);
    console.log('');
  }

  console.log(`NEW (${fresh.length}) - safe to work on:`);
  for (const f of fresh) console.log(`  - ${f.name}${f.phone ? '  ' + f.phone : ''}`);

  // non-zero exit when nothing survives, so a pipeline can stop early
  process.exit(fresh.length ? 0 : 1);
}

main().catch((err) => { console.error(err.message); process.exit(2); });
