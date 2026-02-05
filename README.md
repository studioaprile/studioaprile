# Project Lock (v3) — Canonical Rules

- Site type: static site
- Records source: `/data/records.csv` exported from Notion
- Record images location: `/images/` with naming `MR-YY-XX.webp` + suffixes
- Page media filenames: `home_01..03`, `archive_01..03`, `about_01`, `commission_01`
- Subscribe form: serverless (Cloudflare Worker + MailerSend), CSS-only styling
- Thanks page path: `/thanks/index.html` -> `https://studioaprile.com/thanks/`
- Max render for individual record images: 1024px
- Footer must remain inside layout wrappers
- Layout system: static pages = 3 columns (Header | Media | Text), records pages = 2 columns (Header | Content)
- No HTML changes to subscribe form without backend review

# Studioaprile — Website v3 (Material Recording)

This repository contains the **Studioaprile website (v3)**.

The site is a **static website** published via **GitHub Pages**.
There is **no CMS, no build step, no database**.

All content updates happen by:
- exporting data from **Notion**
- replacing files in this repository
- committing and pushing to GitHub

The **architecture, taxonomy and layout system are locked**.

---

## 0. Canonical content flow (Notion → Website)

**Notion is the authoring environment.  
GitHub is the publishing environment.**

There are only **three types of updates**:

1. Records data → CSV
2. Record images → `/images/`
3. Page images / copy → HTML + `/images/`

Everything else is fixed.

---

## 1. Updating Records (Objects)

### 1.1 In Notion (source of truth)

1. Open **Notion**
2. Go to the database:
Recorded Objects

3. Switch to the website view:
Website – Recorded Objects

4. Ensure:
- All records you want live are visible
- Properties are final
- IDs are correct

---

### 1.2 Export from Notion

From the Notion database view:

1. Click **•••**
2. Select **Export**
3. Format:CSV (with images)
4. Export

Notion will generate a `.csv` file.

---

### 1.3 CSV requirements (website contract)

Before uploading, verify the CSV:

#### File name (mandatory)
records.csv


#### Encoding
UTF-8


#### Required columns (do not rename)
- `id`
- `images`
- `recordDate`

All other columns may exist and are optional.

#### Column order (important)
1. `id`
2. `images`
3. `recordDate`
4. all remaining properties (any order)

#### ID format
MR-YY-XX

or
Archived Research XX-XX-XXX


#### Date format (must match Notion export)
February 3, 2026 12:05 AM


⚠️ Do not change taxonomy values  
⚠️ Do not rename columns  
⚠️ Do not edit CSV structure manually unless necessary

---

### 1.4 Upload CSV to the website

Replace the existing file in the repository:

/data/records.csv


Steps:
1. Drag the new CSV into `/data/`
2. Overwrite the old file
3. Commit
4. Push

The **Records grid** and **Record pages** update automatically.

---

## 2. Updating Record Images

### 2.1 Image preparation (outside Notion)

Images are **not stored in Notion**.

Prepare images locally.

#### Format
- `.webp`
- Square
- Neutral background

#### Naming convention (mandatory)
Use the **record ID**:

MR-25-04.webp ← primary image
MR-25-04_A.webp
MR-25-04_B.webp
MR-25-04_C.webp


Rules:
- The image **without suffix** is the main image
- Suffixes must be `_A`, `_B`, `_C`, etc.
- Filenames must match exactly what is listed in the CSV

---

### 2.2 Upload images to the website

Upload images to:
/images/


Steps:
1. Add `.webp` files to `/images/`
2. Ensure filenames match the `images` column in the CSV
3. Commit
4. Push

No HTML or JS changes required.

---

## 3. Updating Page Media (Home / Archive / About / Commission)

These pages **do not use the CSV**.
They reference **fixed image filenames**.

### 3.1 Fixed image slots

Do **not rename these files**.

/images/home_01.webp
/images/home_02.webp
/images/home_03.webp

/images/archive_01.webp
/images/archive_02.webp
/images/archive_03.webp

/images/about_01.webp
/images/commission_01.webp


Home + Archive:
- Images are shown as **autoplay carousels**

About + Commission:
- Images are shown as **single full-size squares**

---

### 3.2 Updating page images

1. Prepare new `.webp` image
2. Replace the existing file using the **same filename**
3. Commit
4. Push

The site updates automatically.

---

## 4. Updating Text Content (Copy)

Pages:
- `index.html`
- `about.html`
- `archived-research.html`
- `commission.html`

Rules:
- Edit text **only inside content blocks**
- Do not change layout wrappers:
  - `.layout-3col`
  - `.media-area`
  - `.text-area`
- Do not add inline styles

Typography is controlled centrally in `style.css`.

---

## 5. Layout system (do not change)

### Static pages
Header | Media | Text


### Records pages
Header | Content


All pages align to the same top offset:
22px


Any structural change requires a **new version (v4)**.

---

## 6. Deployment & verification

The site is published via **GitHub Pages**.

Before troubleshooting:

1. Confirm branch:
v3

2. Confirm files are pushed
3. Hard refresh:
- Chrome: `Cmd + Shift + R`
4. Verify live JS:
https://studioaprile.com/main.js


---

## 7. Recommended workflow (repeatable)

1. Update Notion
2. Export CSV
3. Replace `/data/records.csv`
4. Add / replace images in `/images/`
5. Commit with clear message
6. Push to `v3`
7. Check live site

---

## 8. What NOT to change

❌ Architecture  
❌ Taxonomy  
❌ CSV column names  
❌ Record rendering logic  
❌ Layout class names  

This is intentional.

---

## 9. Optional (but recommended)

Keep a `CHANGELOG.md`:

2026-02-03

Added MR-26-04

Updated archive carousel images


---

## Final note

This website is designed to be **boring to maintain**.

If updating it ever feels complex, something has drifted and should be simplified.
