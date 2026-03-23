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

function initCarousels() {
  const carousels = document.querySelectorAll(".sa-carousel");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".sa-carousel__track");
    const slides = carousel.querySelectorAll(".sa-carousel__slide");
    if (!track || slides.length < 2) return;

    const intervalMs = Number(carousel.getAttribute("data-interval")) || 1800;
    const transitionMs = Number(carousel.getAttribute("data-transition")) || 360;

    let index = 0;
    track.style.transition = `transform ${transitionMs}ms ease-in-out`;

    setInterval(() => {
      index = (index + 1) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, intervalMs);
  });
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normaliseRecordId(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function formatRecordYear(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "";
  }

  return String(date.getFullYear());
}

function buildRecordAlt(record) {
  const year = formatRecordYear(record.recordDateSort);
  const lead = isNonEmpty(record.material)
    ? `${safeText(record.material, "Wood")} sculptural wood object by Studio Aprile`
    : "Sculptural wood object by Studio Aprile";

  const qualifiers = [record.origin, year, record.dimension]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return [lead, ...qualifiers].join(", ");
}

function buildRecordImageAlt(record, index) {
  const viewLabel = Array.isArray(record.images) && record.images.length > 1 ? `, view ${index + 1}` : "";
  return `${record.alt}${viewLabel}`;
}

function updateRecordSeo(record) {
  if (!record) return;

  const year = formatRecordYear(record.recordDateSort);
  const titleParts = [record.id];

  if (isNonEmpty(record.material)) titleParts.push(record.material);
  titleParts.push("Studio Aprile");
  document.title = titleParts.join(" | ");

  const descriptionParts = [
    `${record.id} is a recorded wood object by Studio Aprile.`,
    [record.material, record.origin, year].filter(Boolean).join(", "),
    [record.failureClass !== "—" ? record.failureClass : "", record.state].filter(Boolean).join(" · ")
  ].filter(Boolean);

  const description = descriptionParts.join(" ");

  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", `https://studioaprile.com/record.html?id=${encodeURIComponent(record.id)}`);
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

    if (ch === '"') {
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
  const headers = rows[0].map((h) => String(h || "").trim());
  const objects = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r.length) continue;

    // Skip totally empty rows
    const hasAny = r.some((cell) => String(cell || "").trim().length > 0);
    if (!hasAny) continue;

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = r[j] !== undefined ? String(r[j]).trim() : "";
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

  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);

  return parts.map((p) => {
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
  const id = normaliseRecordId(o["ID"] || o["Id"] || o["id"] || "");
  const recordDateRaw = o["RecordDate"] || o["Record Date"] || o["recordDate"] || "";
  const material = o["Material"] || "";
  const origin = o["Origin"] || "";
  const failureClass = o["Failure Class"] || o["FailureClass"] || "";
  const state = o["State"] || "";

  const images = normaliseImages(o["Images"] || o["Image"] || "");
  const recordDateSort = parseNotionDate(recordDateRaw);

  const record = {
    // required for grid + routing
    id,
    recordDateRaw,
    recordDateSort,

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

  record.alt = buildRecordAlt(record);

  return record;
}

async function loadRecords() {
  const res = await fetch("./data/records.csv", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`);
  const text = await res.text();
  const rows = parseCSV(text);
  const objs = rowsToObjects(rows);

  const records = objs
    .map(mapNotionRowToRecord)
    .filter((r) => typeof r.id === "string" && r.id.startsWith("MR-"));

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
      const coverImage = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : "";
      const itemLabel = `${safeText(r.id)} — ${safeText(r.material, "Wood")} from ${safeText(r.origin, "unknown origin")}`;

      return `
        <article class="record-tile">
          <a class="record-tile-link" href="record.html?id=${encodeURIComponent(r.id)}" aria-label="View ${escapeHtml(itemLabel)}">
            <figure class="record-tile-image">
              ${
                coverImage
                  ? `<img loading="lazy" src="${coverImage}" alt="${escapeHtml(r.alt)}">`
                  : `<div class="record-tile-placeholder" aria-hidden="true"></div>`
              }
            </figure>
            <div class="record-tile-meta">
              <h2 class="record-tile-id">${escapeHtml(safeText(r.id))}</h2>
              <p class="record-tile-line">${escapeHtml(safeText(r.material))} · ${escapeHtml(safeText(r.origin))}</p>
              <p class="record-tile-line">${escapeHtml(safeText(r.failureClass))} · ${escapeHtml(safeText(r.state))}</p>
            </div>
          </a>
        </article>
      `;
    })
    .join("");
}

function renderRecordPage(records) {
  const container = document.getElementById("record-container");
  if (!container) return;

  const id = normaliseRecordId(getQueryParam("id"));
  if (!id) {
    container.innerHTML = "<p>Record not found.</p>";
    return;
  }

  const record = records.find((r) => r.id === id);
  if (!record) {
    container.innerHTML = `<p>Record not found: ${escapeHtml(safeText(id))}</p>`;
    return;
  }

  updateRecordSeo(record);

  const fields = [
    ["ID", record.id],
    ["Record Date", record.recordDateRaw],
    ["Material · Origin", `${safeText(record.material)} · ${safeText(record.origin)}`],
    ["Material condition", record.materialCondition],
    ["Geometry class", record.geometryClass],
    ["Dimension", record.dimension],
    ["Turning orientation", record.turningOrientation],
    ["Drying orientation", record.dryingOrientation],
    ["Failure class", record.failureClass],
    ["State", record.state],
    ["Intervention", record.intervention],
    ["Availability", record.availability]
  ];

  const metaHtml = fields
    .filter(([, v]) => isNonEmpty(v))
    .map(([k, v]) => {
      const value = k === "Record Date" && !Number.isNaN(record.recordDateSort.getTime()) && record.recordDateSort.getTime() !== 0
        ? `<time datetime="${record.recordDateSort.toISOString()}">${escapeHtml(safeText(v))}</time>`
        : escapeHtml(safeText(v));

      return `<div class="meta-row"><dt class="meta-key">${escapeHtml(k)}</dt><dd class="meta-val">${value}</dd></div>`;
    })
    .join("");

  const images = Array.isArray(record.images) ? record.images : [];
  const imagesHtml = images.length
    ? images
        .map(
          (src, idx) => `
            <figure class="record-figure">
              <img class="record-image" loading="lazy" src="${src}" alt="${escapeHtml(buildRecordImageAlt(record, idx))}">
            </figure>`
        )
        .join("")
    : `<p class="muted">Images pending.</p>`;

  const acquisition = isNonEmpty(record.acquisitionUrl)
    ? `<a class="btn" href="${record.acquisitionUrl}" target="_blank" rel="noopener noreferrer">Acquire</a>`
    : "";

  container.innerHTML = `
    <article class="record-entry">
      <header class="record-header">
        <h1>${escapeHtml(safeText(record.id))}</h1>
        <div class="record-actions">
          <a class="btn secondary" href="records.html">Back to Records</a>
          ${acquisition}
        </div>
      </header>

      <section class="record-meta" aria-labelledby="record-details-heading">
        <h2 id="record-details-heading" class="sr-only">Record details</h2>
        ${metaHtml ? `<dl class="meta-list">${metaHtml}</dl>` : "<p class='muted'>No metadata available.</p>"}
      </section>

      <section class="record-images" aria-labelledby="record-images-heading">
        <h2 id="record-images-heading" class="sr-only">Record images</h2>
        ${imagesHtml}
      </section>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const nav = document.querySelector(".site-nav");
  const btn = document.querySelector(".site-nav__toggle");
  if (nav && btn) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Always initialise carousels immediately (do not depend on CSV)
  initCarousels();

  // Only load CSV if the page actually contains records UI
  const hasRecordsGrid = !!document.getElementById("records-grid");
  const hasRecordContainer = !!document.getElementById("record-container");

  if (!hasRecordsGrid && !hasRecordContainer) return;

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
    console.error(e);
  }
});
