// recordsData.js
// Material Recording records ONLY (id must start with "MR-").
// recordDate format: dd/mm/yyyy

const recordsData = [
  {
    id: "MR-26-001",
    recordDate: "30/01/2026",
    material: "Oak",
    origin: "Essex",
    failureClass: "—",
    state: "Active",

    // New properties (v3)
    materialCondition: "",
    geometryClass: "",

    // Optional properties (render only if present / non-empty)
    dimensions: "",
    turningOrientation: "",
    dryingOrientation: "",
    intervention: "",
    availability: "",
    acquisitionUrl: "",

    // Images: square, same object, vertical stack on record page
    thumbnail: "",
    images: []
  }
];

// NOTE: Replace the sample record above with your real dataset.
// You can leave fields blank; the record page hides missing values.
