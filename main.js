/* main.js (v3 CSV)
   Data source: ./data/records.csv (Notion export)
*/

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function safeText(value, fallback = "—") {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim();
  return s.length ? s : fallback;
}

function isNonEmpty(value) {
  if (value === undefined || value === null) return false;
  return String(value).trim().length > 0;
}

// Parse Notion "February 3, 2026 12:05 AM" safely.
// Use for sorting only.
function parseNotionDate(dateStr) {
  const s = String(dateStr || "").trim();
  if (!s) return new Date(0);
  const t = Date.parse(s);
  if (Number.isNaN(t)) return new Date(0);
  return new Date(t);
}

// Minimal CSV parser supporting quoted fields.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' ) {
      if (inQuotes && next === '"') {
        // Escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cur);
      cur = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      // Handle CRLF
      if (ch === "\r" && next === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }

    cur += ch;
  }

  // last cell
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

// Map header -> value
function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => String(h || "").trim());
  const objects = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r.length) continue;

    // Skip totally empty rows
    const hasAny = r.some(cell => String(cell || "").trim().length > 0);
    if (!hasAny) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (r[j] !== undefined ? String(r[j]).trim() : "");
    }
    objects.push(obj);
  }

  return objects;
}

// Normalise Images cell:
// - split by comma
// - remove any prefix path (including encoded ones)
// - keep filename
// - build ./images/<filename>
function normaliseImages(imagesCell) {
  const raw = String(imagesCell || "").trim();
  if (!raw) return [];

  const parts = raw.split(",").map(p => p.trim()).filter(Boolean);

  return parts.map(p => {
    // remove query strings/fragments
    const noQS = p.split("?")[0].split("#")[0];

    // handle backslashes
    const fixed = noQS.replace(/\\/g, "/");

    // keep only filename after last slash
    const filename = fixed.includes("/") ? fixed.split("/").pop() : fixed;

    return `./images/${filename}`;
  });
}

// Build a stable internal model from Notion object
function mapNotionRowToRecord(o) {
  // Expect these headers (exact from Notion export):
  // ID, Images, RecordDate, Material, Origin, Failure Class, State, etc.
  const id = o["ID"] || o["Id"] || o["id"] || "";
  const recordDateRaw = o["RecordDate"] || o["Record Date"] || o["recordDate"] || "";
  const material = o["Material"] || "";
  const origin = o["Origin"] || "";
  const failureClass = o["Failure Class"] || o["FailureClass"] || "";
  const state = o["State"] || "";

  const images = normaliseImages(o["Images"] || o["Image"] || "");

  return {
    // required for grid + routing
    id: id,
    recordDateRaw: recordDateRaw,
    recordDateSort: parseNotionDate(recordDateRaw),

    // grid fields
    material,
    origin,
    failureClass: failureClass || "—",
    state,

    // extra fields (render only if present)
    materialCondition: o["Material condition"] || o["MaterialCondition"] || "",
    geometryClass: o["Geometry class"] || o["GeometryClass"] || "",
    dimension: o["Dimension"] || "",
    turningOrientation: o["Turning Orientation"] || o["TurningOrientation"] || "",
    dryingOrientation: o["Drying Orientation"] || o["DryingOrientation"] || "",
    intervention: o["Intervention"] || "",
    availability: o["Availability"] || "",
    acquisitionUrl: o["Acquisition (Stripe)"] || o["AcquisitionStripe"] || o["Acquisition"] || "",

    images
  };
}

async function loadRecords() {
  const res = await fetch("./data/records.csv", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`);
  const text = await res.text();
  const rows = parseCSV(text);
  const objs = rowsToObjects(rows);

  const records = objs
    .map(mapNotionRowToRecord)
    .filter(r => typeof r.id === "string" && r.id.startsWith("MR-"));

  // Sort most recent first
  records.sort((a, b) => b.recordDateSort - a.recordDateSort);

  return records;
}

function renderRecordsGrid(records) {
  const grid = document.getElementById("records-grid");
  if (!grid) return;

  if (!records.length) {
    grid.innerHTML = "<p class='muted'>No records available.</p>";
    return;
  }

  grid.innerHTML = records
    .map((r) => {
      const coverImage =
        Array.isArray(r.images) && r.images.length > 0
          ? r.images[0]
          : "";

      return `
        <a class="record-tile" href="record.html?id=${encodeURIComponent(r.id)}">
          <div class="record-tile-image">
            ${
              coverImage
                ? `<img loading="lazy" src="${coverImage}" alt="${safeText(r.id)} cover image">`
                : `<div class="record-tile-placeholder"></div>`
            }
          </div>
          <div class="record-tile-meta">
            <div class="record-tile-id">${safeText(r.id)}</div>
            <div class="record-tile-line">${safeText(r.material)} · ${safeText(r.origin)}</div>
            <div class="record-tile-line">${safeText(r.failureClass)} · ${safeText(r.state)}</div>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderRecordPage(records) {
  const container = document.getElementById("record-container");
  if (!container) return;

  const id = getQueryParam("id");
  if (!id) {
    container.innerHTML = "<p>Record not found.</p>";
    return;
  }

  const record = records.find(r => r.id === id);
  if (!record) {
    container.innerHTML = `<p>Record not found: ${safeText(id)}</p>`;
    return;
  }

  const fields = [
    ["ID", record.id],
    ["Record Date", record.recordDateRaw],
    ["Material · Origin", `${safeText(record.material)} · ${safeText(record.origin)}`],
    ["Material condition", record.materialCondition],
    ["Geometry class", record.geometryClass],
    ["Dimension", record.dimension],
    ["Turning Orientation", record.turningOrientation],
    ["Drying Orientation", record.dryingOrientation],
    ["Failure Class", record.failureClass],
    ["State", record.state],
    ["Intervention", record.intervention],
    ["Availability", record.availability]
  ];

  const metaHtml = fields
    .filter(([, v]) => isNonEmpty(v))
    .map(([k, v]) => `<div class="meta-row"><div class="meta-key">${k}</div><div class="meta-val">${safeText(v)}</div></div>`)
    .join("");

  const images = Array.isArray(record.images) ? record.images : [];
  const imagesHtml = images.length
    ? images.map((src, idx) =>
        `<img class="record-image" loading="lazy" src="${src}" alt="${safeText(record.id)} image ${idx + 1}">`
      ).join("")
    : `<p class="muted">Images pending.</p>`;

  const acquisition = isNonEmpty(record.acquisitionUrl)
    ? `<a class="btn" href="${record.acquisitionUrl}" target="_blank" rel="noopener noreferrer">Acquire</a>`
    : "";

  container.innerHTML = `
    <div class="record-header">
      <h1>${safeText(record.id)}</h1>
      <div class="record-actions">
        <a class="btn secondary" href="records.html">Back to Records</a>
        ${acquisition}
      </div>
    </div>

    <section class="record-meta">
      ${metaHtml || "<p class='muted'>No metadata available.</p>"}
    </section>

    <section class="record-images">
      ${imagesHtml}
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const nav = document.querySelector(".site-nav");
  const toggle = nav ? nav.querySelector(".site-nav__toggle") : null;

  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  try {
    const records = await loadRecords();
    renderRecordsGrid(records);
    renderRecordPage(records);
  } catch (e) {
    const grid = document.getElementById("records-grid");
    const container = document.getElementById("record-container");
    const msg = `<p class="muted">Error loading records: ${safeText(e.message)}</p>`;
    if (grid) grid.innerHTML = msg;
    if (container) container.innerHTML = msg;
    // Also log for debugging
    console.error(e);
  }
});
