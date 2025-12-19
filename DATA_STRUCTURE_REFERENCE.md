// ===== MARKER/LANDMARK DATA STRUCTURE =====

// Frontend - MarkerModal.vue component receives/emits this structure:
{
  name: string,                          // Required: "Hồ Hoàn Kiếm"
  lat: number,                           // Required: 21.0285
  lng: number,                           // Required: 105.8048
  city: string,                          // Optional (legacy field): "Hà Nội"
  description: string,                   // Optional: "Famous lake..."
  houseNumberOrOfficeName: string,       // Optional: "12A"
  ward: string,                          // Required: "Phường Hoàn Kiếm"
  district: string,                      // Required: "Quận Hoàn Kiếm"
  province: string,                      // Required: "Thành phố Hà Nội"
  country: string                        // Default: "Vietnam"
}

// Backend - Database row includes:
{
  id: number,                            // Auto-generated primary key
  name: string,
  lat: decimal,
  lng: decimal,
  city: string,
  description: string,
  house_number_or_office_name: string,
  ward: string,
  district: string,
  province: string,
  country: string,
  created_at: timestamp,                 // Auto-set on insert
  updated_at: timestamp,                 // Auto-set on insert/update
  fullAddress: string                    // Virtual field computed by buildFullAddress()
}

// Computed fullAddress format:
// [houseNumberOrOfficeName] ward, district, province, country
// Example: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam"
// If no house number: "Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam"

// ===== FRONTEND STATE IN Mars3DMap.vue =====

// Marker graphic attributes:
graphic.attr = {
  type: "marker",
  name: string,
  city: string,
  description: string,
  id: number,                            // Backend ID for update/delete
  houseNumberOrOfficeName: string,
  ward: string,
  district: string,
  province: string,
  country: string,
  fullAddress: string,
  originalScale: number,                 // 1 (normal state)
  originalImage: string,                 // Data URI for red pin
  highlightImage: string                 // Data URI for gold pin
}

// Tooltip display data:
{
  name: string,
  fullAddress: string,
  description: string,
  lat: number,
  lng: number
}

// ===== API ENDPOINTS =====

// GET /api/landmarks
// Returns: Array<Landmark>

// POST /api/landmarks
// Body: Omit id, created_at, updated_at, fullAddress
// Returns: Landmark with generated id, timestamps, and fullAddress

// PUT /api/landmarks/:id
// Body: Partial update, same fields as POST
// Returns: Updated Landmark object

// DELETE /api/landmarks/:id
// Returns: { success: true, deleted: Landmark }

// ===== VALIDATION RULES =====

Frontend Validation (MarkerModal.vue):
✓ name: Must not be empty
✓ ward: Must not be empty
✓ district: Must not be empty
✓ province: Must not be empty
✓ houseNumberOrOfficeName: Optional, max 255 chars
✓ country: Default "Vietnam", max 100 chars
✓ lat/lng: Read-only, set by click position

Backend Validation (landmarks.js):
✓ name: Required, cannot be empty
✓ ward: Required, cannot be empty
✓ district: Required, cannot be empty
✓ province: Required, cannot be empty
✓ country: If not provided, auto-set to "Vietnam"
✓ houseNumberOrOfficeName: Optional, NULL if not provided

// ===== MARKER INTERACTION LIFECYCLE =====

1. HOVER (Desktop) or LONG-PRESS (Mobile):
   - highlightMarker(graphic)
   - showMarkerTooltip(landmark, position)
   - Scale: 1 → 1.3
   - Color: Red → Gold (#fbbf24)
   - Label color: White → Golden

2. LEAVE HOVER or END LONG-PRESS:
   - hideMarkerTooltip() (100ms delay)
   - dehighlightMarker(graphic)
   - Scale: 1.3 → 1
   - Color: Gold → Red
   - Label color: Golden → White

3. CLICK:
   - If pendingDeleteMarker: deleteMarker(graphic)
   - Else: openEditModal(graphic)
   - Tooltip hidden on modal open
   - Highlight cleared on modal close

// ===== TOOLTIP POSITIONING =====

Desktop:
- Position: 10px offset from cursor
- Boundary check: If hits viewport edge, reposition
- Auto-hide on mouse leave (with 100ms delay)

Mobile:
- Position: Center of screen
- Responsive: Max 90vw width
- Dismissible: Tap outside to close
- Font size: Adjusted for mobile screens

// ===== COLOR SCHEME =====

Normal State:
- Pin icon: #e63946 (red)
- Label background: rgba(0, 0, 0, 0.7)
- Label text: #ffffff (white)
- Scale: 1.0

Highlighted State:
- Pin icon: #fbbf24 (gold)
- Label background: rgba(0, 0, 0, 0.9)
- Label text: #fbbf24 (gold)
- Scale: 1.3

Tooltip:
- Background: Linear gradient(135deg, #1e293b, #0f172a)
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Address text: #cbd5e1 (slate-300)
- Coords: #60a5fa (blue-400)

// ===== DATABASE SCHEMA (POSTGRES) =====

CREATE TABLE landmarks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  city VARCHAR(255),
  description TEXT,
  house_number_or_office_name VARCHAR(255),
  ward VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Vietnam',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Indices for performance:
// CREATE INDEX idx_ward ON landmarks(ward);
// CREATE INDEX idx_district ON landmarks(district);
// CREATE INDEX idx_province ON landmarks(province);
// CREATE INDEX idx_country ON landmarks(country);
