// main.js (v3)

function parseDDMMYYYY(dateStr) {
  // dateStr: "dd/mm/yyyy"
  const [dd, mm, yyyy] = String(dateStr).split("/").map(Number);
  if (!dd || !mm || !yyyy) return new Date(0);
  return new Date(yyyy, mm - 1, dd);
}

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

function renderRecordsGrid() {
  const grid = document.getElementById("records-grid");
  if (!grid) return;
  if (typeof recordsData === "undefined") {
    grid.innerHTML = "<p class='muted'>Records data not loaded.</p>";
    return;
  }

  // Filter MR-only, sort most recent first
  const sorted = [...recordsData]
    .filter((r) => typeof r.id === "string" && r.id.startsWith("MR-"))
    .sort((a, b) => parseDDMMYYYY(b.recordDate) - parseDDMMYYYY(a.recordDate));

  if (!sorted.length) {
    grid.innerHTML = "<p class='muted'>No records available.</p>";
    return;
  }

  grid.innerHTML = sorted
    .map((r) => {
      const materialOrigin = `${safeText(r.material)} · ${safeText(r.origin)}`;
      return `
        <a class="record-row" href="record.html?id=${encodeURIComponent(r.id)}">
          <div class="col id">${safeText(r.id)}</div>
          <div class="col material-origin">${materialOrigin}</div>
          <div class="col failure">${safeText(r.failureClass)}</div>
          <div class="col state">${safeText(r.state)}</div>
        </a>
      `;
    })
    .join("");
}

function renderRecordPage() {
  const container = document.getElementById("record-container");
  if (!container) return;
  if (typeof recordsData === "undefined") {
    container.innerHTML = "<p class='muted'>Records data not loaded.</p>";
    return;
  }

  const id = getQueryParam("id");
  if (!id) {
    container.innerHTML = "<p>Record not found.</p>";
    return;
  }

  const record = recordsData.find((r) => r.id === id);
  if (!record) {
    container.innerHTML = `<p>Record not found: ${safeText(id)}</p>`;
    return;
  }

  const year = parseDDMMYYYY(record.recordDate).getFullYear();
  const materialOrigin = `${safeText(record.material)} · ${safeText(record.origin)}`;

  const fields = [
    ["ID + Record Year", `${safeText(record.id)} · ${isFinite(year) ? year : "—"}`],
    ["Record Date", record.recordDate],
    ["Material · Origin", materialOrigin],
    ["Material condition", record.materialCondition], // NEW
    ["Geometry class", record.geometryClass],         // NEW
    ["Dimensions", record.dimensions],
    ["Turning Orientation", record.turningOrientation],
    ["Drying Orientation", record.dryingOrientation],
    ["Failure Class", record.failureClass],
    ["State", record.state],
    ["Intervention", record.intervention],
    ["Availability", record.availability]
  ];

  const metaHtml = fields
    .filter(([, v]) => isNonEmpty(v))
    .map(([k, v]) => {
      return `<div class="meta-row"><div class="meta-key">${k}</div><div class="meta-val">${safeText(v)}</div></div>`;
    })
    .join("");

  const images = Array.isArray(record.images) ? record.images : [];
  const imagesHtml = images.length
    ? images.map((src) => `<img class="record-image" src="${src}" alt="${safeText(record.id)}">`).join("")
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

document.addEventListener("DOMContentLoaded", () => {
  renderRecordsGrid();
  renderRecordPage();
});
