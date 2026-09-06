# Multi-template migration

Bring the micare template into the outreach portal alongside the existing
one, so a lead can be pitched with either, **without changing anything
about how already-sent links behave**.

---

## The hard constraint

`https://outreach-kappa-tawny.vercel.app/vinit-sampel-eklyi` and every
other link already in someone's inbox must keep rendering exactly as it
does today.

That drives two decisions:

1. **The `template` column defaults to `'classic'`.** Every existing row
   gets that value the moment the column is added, so every existing slug
   keeps resolving to the same file it does now.
2. **The classic render path is moved, not rewritten.** Its code is
   lifted into `lib/render/classic.js` verbatim — same regexes, same
   fallbacks, same output. The known defects in it (the `tel:` link
   losing its `+`, the `og:title` still saying "Rowan Grove") are
   deliberately left alone. Fixing them is a separate, opt-in change;
   doing it here would mean old links start rendering differently in the
   middle of a migration, which is exactly what we were asked to avoid.

---

## Step 1 — Database

One column. Run this yourself:

```sql
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'classic';
```

Optional, but worth it — stops a typo writing a template nobody serves:

```sql
ALTER TABLE leads
  ADD CONSTRAINT leads_template_check
  CHECK (template IN ('classic', 'micare'));
```

Nothing else changes. No new table, no data migration, no backfill —
`DEFAULT 'classic'` handles every existing row in place.

**Rollback:** `ALTER TABLE leads DROP COLUMN template;` — the code treats
a missing/unknown value as `classic`, so the app survives the column
disappearing.

---

## Step 2 — Template registry

`lib/templates.js` becomes the single source of truth:

| id | label | file | base href |
|---|---|---|---|
| `classic` | Classic | `index.html` | `/` |
| `micare` | Micare | `public/micare/index.html` | `/micare/` |

`resolveTemplate(id)` returns the classic entry for anything unknown,
`null`, or `undefined`. That is what makes an old row, a dropped column,
or a bad import all fail safe.

---

## Step 3 — Assets

Micare goes to `public/micare/`, keeping its own relative structure so
`<base href="/micare/">` resolves `css/styles.css` and `image/x.webp`
without rewriting a single path.

**Deduplicated against what the portal already ships.** Eight of
micare's images are byte-identical (verified by md5) to files already in
`public/img/`:

```
bg-img-1  bg-img-3  cpp-img  fp-img  gc-img  hc-img  header-1  vc-img
```

These are **not** copied. Their references in micare's HTML are changed
to root-absolute `/img/…`, which `<base>` leaves alone. Saves ~740 KB and
means one copy to update.

The other ten (`bg-1`, `header-bg-1`, `img-1`…`img-6`,
`img-education-content`, `logo-1`) have **no name clash** with anything
in `public/img/`, so they keep their names and live in
`public/micare/image/`.

Also dropped, because nothing loads them:

- 18 of 34 `js/` files (`map.min.js` alone is 958 KB)
- 6 of 13 `css/` files
- the four orphan pages, `scss/`, `contact/`, `styles.orange-backup.css`

---

## Step 4 — Rendering

`app/[slug]/route.js` stops knowing about any specific template. It looks
the lead up, resolves the template, and hands off:

```
lead.template → resolveTemplate() → render(html, lead) → response
```

Two renderers:

- **`lib/render/classic.js`** — the current logic, moved verbatim.
- **`lib/render/micare.js`** — new. Rewrites micare's `const CLINIC = {…};`
  block with the lead's clinic name, doctor, phone, email and address,
  falling back to our own contact details when a field is empty.

Both escape `<` as `<` when serialising into the `<script>` block, so
a clinic name containing `</script>` cannot break out. The classic path
gains this too — it is a safety fix that cannot change the output for any
name that does not contain markup.

---

## Step 5 — Admin

Template is picked in three places, all writing the same column:

1. **Import page** — a selector that sets the template for the whole
   batch, plus an optional `Template` column in the CSV that overrides it
   per row.
2. **Lead table** — a per-lead dropdown, and a bulk action to set the
   template on everything currently selected.
3. **Composer** — shows which template each recipient will get before you
   send, so it is never a surprise.

---

## Step 6 — Template preview

`/preview/<template>` renders any template with sample data and no
database row, so both can be looked at without burning a lead. Behind the
same auth as the rest of the admin.

---

## Verification — results

Run against a production build (`npm run build && npm start`).

| Check | Result |
|---|---|
| Classic renders byte-identically to the pre-migration code | **5/5 leads identical** — real, empty, single-word-doctor, no-city, and the live sample |
| A live slug still serves **while the column does not yet exist** | `/vinit-sampel-eklyi` → **200**, renders "Vinit sampel" |
| Unknown / null / undefined / empty template → classic | **all 4 pass** |
| Micare injects the lead's own details | name, doctor, phone, email, address all present |
| `<base>` correct per template | `/` for classic, `/micare/` for micare, not doubled, idempotent |
| Every micare asset resolves | 42 relative + 8 shared, **all exist on disk and return 200** |
| Shared images deduplicated | 8 distinct files served from `/img/`, **no second copy shipped** |
| `/admin/preview/classic` and `/micare` | **200** — 199 KB and 116 KB |
| Unknown template id | **404** |
| Preview without a session | **307 → /login** |
| `</script>` in a clinic name | escaped in both renderers |
| Production build | **clean, zero warnings** |

Verified by `scratchpad/verify-classic.mjs` and `verify-micare.mjs`, which
diff the old and new render paths directly rather than eyeballing output.

### Not yet verified

Serving a lead whose `template = 'micare'` end-to-end — the column does
not exist yet. The preview route exercises the identical renderer,
loader and `<base>` logic, so what remains untested is only the column
read itself.

### One thing the schema file gets wrong

`leads.id` is **`integer`** (`nextval('leads_id_seq')`), not the
`String @default(cuid())` that `prisma/schema.prisma` claims. The bulk
action casts `id::text` so it works either way, but the Prisma file is
misleading and should be deleted or regenerated.
