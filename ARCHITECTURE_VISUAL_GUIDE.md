# Location Management System - Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MARS3D LOCATION MAP                      │
│                      (Frontend - Vue 3)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │  ControlPanel     │  │  TopToolbar      │  │ StatsDisplay│ │
│  │  (UI Controls)    │  │  (Search, etc)   │  │  (Counters) │ │
│  └───────────────────┘  └──────────────────┘  └─────────────┘ │
│           ▲                                                     │
│           │ emit events                                        │
│           ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Mars3DMap Component                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  Map Container (Cesium/Mars3D)                     │ │ │
│  │  │                                                     │ │ │
│  │  │  🔴 Marker 1: Hồ Hoàn Kiếm                        │ │ │
│  │  │  🔴 Marker 2: Nhà Thờ Lớn Hà Nội                  │ │ │
│  │  │  🔴 Marker N: ...                                 │ │ │
│  │  │                                                     │ │ │
│  │  │  Interactions:                                      │ │ │
│  │  │  • Hover → Tooltip + Highlight (scale 1.3x)       │ │ │
│  │  │  • Click → Edit modal or Delete mode               │ │ │
│  │  │  • Long-press (mobile) → Tooltip + Highlight      │ │ │
│  │  │                                                     │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                         ▲                                 │ │
│  │        State Management │                                │ │
│  │                         ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  Component State (Reactive Refs)                   │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │ • markers: Array<Graphic>                          │ │ │
│  │  │ • isModalOpen: Boolean                             │ │ │
│  │  │ • tooltipVisible: Boolean                          │ │ │
│  │  │ • tooltipPosition: {x, y}                          │ │ │
│  │  │ • tooltipLandmark: Landmark                        │ │ │
│  │  │ • currentHighlightedMarker: Graphic                │ │ │
│  │  │ • currentEditingMarker: Graphic                    │ │ │
│  │  │ • pendingDeleteMarker: Boolean                     │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                         ▲                                 │ │
│  │        Data Operations  │                                │ │
│  │                         ▼                                │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  Helper Functions                                  │ │ │
│  │  ├─────────────────────────────────────────────────────┤ │ │
│  │  │ • loadMarkersFromBackend()                         │ │ │
│  │  │ • saveMarkerToBackend(data)                        │ │ │
│  │  │ • updateMarker(marker, data)                       │ │ │
│  │  │ • deleteMarker(marker)                             │ │ │
│  │  │ • createMarkerGraphic(landmark)                    │ │ │
│  │  │ • showMarkerTooltip(landmark, pos)                 │ │ │
│  │  │ • hideMarkerTooltip()                              │ │ │
│  │  │ • highlightMarker(marker)                          │ │ │
│  │  │ • dehighlightMarker(marker)                        │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│           ▲                                                     │
│           │ API Calls                                          │
│           ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Modal Components (Teleported)                    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  MarkerModal.vue                                   │ │ │
│  │  │  ├─ Title: "Thêm Marker Mới" or "Chỉnh sửa"      │ │ │
│  │  │  ├─ 📍 Thông tin cơ bản                           │ │ │
│  │  │  │  ├─ Tên địa điểm *                             │ │ │
│  │  │  │  └─ Mô tả                                       │ │ │
│  │  │  ├─ 🏠 Địa chỉ                                    │ │ │
│  │  │  │  ├─ Số nhà / Tên văn phòng                      │ │ │
│  │  │  │  ├─ Phường/Xã *                                 │ │ │
│  │  │  │  ├─ Quận/Huyện *                                │ │ │
│  │  │  │  ├─ Tỉnh/Thành phố *                            │ │ │
│  │  │  │  ├─ Quốc gia                                    │ │ │
│  │  │  │  └─ Thành phố (legacy)                          │ │ │
│  │  │  ├─ 🗺️ Tọa độ                                     │ │ │
│  │  │  │  ├─ Lat (read-only)                             │ │ │
│  │  │  │  └─ Lng (read-only)                             │ │ │
│  │  │  ├─ 📋 Địa chỉ đầy đủ (live preview)             │ │ │
│  │  │  └─ [❌ Hủy] [✅ Lưu]                              │ │ │
│  │  │        @close    @save                             │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  AddressTooltip.vue                                │ │ │
│  │  │  (Shown on hover or long-press)                    │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌───────────────────────────────────────────────┐ │ │
│  │  │  │ 📍 Hồ Hoàn Kiếm                              │ │ │
│  │  │  ├───────────────────────────────────────────────┤ │ │
│  │  │  │ 12 Phường Hoàn Kiếm,                         │ │ │
│  │  │  │ Quận Hoàn Kiếm,                              │ │ │
│  │  │  │ Thành phố Hà Nội,                            │ │ │
│  │  │  │ Vietnam                                       │ │ │
│  │  │  │                                               │ │ │
│  │  │  │ Famous lake in Hanoi...                       │ │ │
│  │  │  │                                               │ │ │
│  │  │  │ 🔴 21.028511                                 │ │ │
│  │  │  │ 🔵 105.804817                                │ │ │
│  │  │  └───────────────────────────────────────────────┘ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          ║                                    ║
   HTTP   ║  GET /api/landmarks              ║  HTTP
   POST   ║  POST /api/landmarks             ║  PUT
   PUT    ║  PUT /api/landmarks/:id          ║  DELETE
   DELETE ║  DELETE /api/landmarks/:id       ║
          ║                                    ║
          ▼                                    ▼
    ┌──────────────────────────────────────────────────┐
    │         BACKEND SERVER (Express.js)              │
    │         http://localhost:5000                    │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │  ┌────────────────────────────────────────────┐ │
    │  │  API Routes (routes/landmarks.js)         │ │
    │  ├────────────────────────────────────────────┤ │
    │  │ • router.get('/')                         │ │
    │  │ • router.post('/')                        │ │
    │  │ • router.put('/:id')                      │ │
    │  │ • router.delete('/:id')                   │ │
    │  │ • router.post('/bulk-save')               │ │
    │  │                                            │ │
    │  │ Functions:                                 │ │
    │  │ • buildFullAddress(landmark)              │ │
    │  │ • Validate required fields                │ │
    │  │ • Auto-set country = "Vietnam"            │ │
    │  └────────────────────────────────────────────┘ │
    │           ▲                                      │
    │           │ SQL Queries                         │
    │           ▼                                      │
    │  ┌────────────────────────────────────────────┐ │
    │  │  Database Connection (db.js)              │ │
    │  │  PostgreSQL Client (postgres.js)          │ │
    │  └────────────────────────────────────────────┘ │
    │           ▲                                      │
    │           │ postgres() queries                  │
    │           ▼                                      │
    │  ┌────────────────────────────────────────────┐ │
    │  │  Migration Script (migrate.js)            │ │
    │  │  • CREATE TABLE landmarks                 │ │
    │  │  • ALTER TABLE ADD COLUMN ...             │ │
    │  │  • Set defaults and constraints           │ │
    │  └────────────────────────────────────────────┘ │
    │                                                  │
    └──────────────────────────────────────────────────┘
          ║                                    ║
          ║   SELECT, INSERT, UPDATE, DELETE  ║
          ║   SQL via postgres library        ║
          ║                                    ║
          ▼                                    ▼
    ┌──────────────────────────────────────────────────┐
    │      POSTGRESQL DATABASE (Supabase)              │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │  landmarks TABLE:                               │
    │  ┌────────────────────────────────────────────┐ │
    │  │ id (PK) │ name     │ lat   │ lng   │ ...   │ │
    │  ├─────────┼──────────┼───────┼───────┼───────┤ │
    │  │ 1       │ Hồ HK    │ 21.0  │105.8  │ ...   │ │
    │  │ 2       │ Nhà Thờ  │ 21.0  │105.8  │ ...   │ │
    │  │ 3       │ Mausoleum│ 21.0  │105.8  │ ...   │ │
    │  │ ...     │ ...      │ ...   │ ...   │ ...   │ │
    │  └────────────────────────────────────────────┘ │
    │                                                  │
    │  NEW COLUMNS:                                   │
    │  • house_number_or_office_name (VARCHAR 255)    │
    │  • ward (VARCHAR 255) - NOT NULL                │
    │  • district (VARCHAR 255) - NOT NULL            │
    │  • province (VARCHAR 255) - NOT NULL            │
    │  • country (VARCHAR 100) DEFAULT 'Vietnam'      │
    │  • created_at (TIMESTAMP)                       │
    │  • updated_at (TIMESTAMP)                       │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

---

## Component Communication Flow

### Adding a Location

```
User Input
    │
    ▼
ControlPanel emits @add-marker
    │
    ▼
Mars3DMap receives, calls addMarker()
    │
    ├─ Set pendingAddMarker = true
    ├─ Change cursor to "crosshair"
    └─ Wait for map click
        │
        ▼
    User clicks map
        │
        ▼
    handleMapClickForMarker(event)
        │
        ├─ Extract coordinates
        ├─ Call addMarkerAt(lng, lat)
        │
        ▼
    addMarkerAt() opens modal
        │
        ├─ Set modalMarkerData.lat/lng
        ├─ Set isModalOpen = true
        └─ MarkerModal component mounts
            │
            ▼
        User fills form
            │
            ├─ name, ward, district, province
            ├─ Optional: houseNumberOrOfficeName, city, description
            └─ Live address preview updates
                │
                ▼
            User clicks "✅ Lưu"
                │
                ▼
            MarkerModal emits @save(data)
                │
                ▼
            Mars3DMap receives, calls saveMarkerFromModal(data)
                │
                ├─ Validate all required fields
                │
                ▼
            createNewMarker(data)
                │
                ├─ Call saveMarkerToBackend(data)
                │   └─ POST to /api/landmarks
                │       └─ Returns: saved landmark with id
                │
                ├─ createMarkerGraphic(saved)
                │   └─ Creates Cesium BillboardEntity
                │       ├─ Position: [lng, lat]
                │       ├─ Icon: red pin
                │       ├─ Attributes: all address fields
                │       ├─ Event: mouseover → tooltip + highlight
                │       ├─ Event: mouseout → hide tooltip
                │       └─ Event: click → edit modal
                │
                ├─ closeModal()
                │   └─ Cleanup state
                │
                └─ showInfo("✅ Đã thêm marker...")

Result: Marker visible on map with tooltip ready
```

### Hovering Over Marker (Desktop)

```
User moves mouse over marker
    │
    ▼
Cesium emits 'mouseover' event
    │
    ▼
Event handler: graphic.on('mouseover', ...)
    │
    ├─ Call showMarkerTooltip(landmark, position)
    │   │
    │   ├─ Set tooltipPosition from cursor
    │   ├─ Set tooltipLandmark from graphic.attr
    │   ├─ Set tooltipVisible = true
    │   │
    │   ▼
    │   AddressTooltip component mounts (Teleported)
    │   │
    │   ├─ Display: "📍 Name"
    │   ├─ Display: "Full Address"
    │   ├─ Display: "Description"
    │   ├─ Display: "Coordinates"
    │   └─ Fade-in animation
    │
    └─ Call highlightMarker(graphic)
        │
        ├─ marker.style.scale = 1.3
        ├─ marker.style.image = highlightImage (gold)
        └─ marker.style.label.color = gold

Result: Tooltip visible, marker highlighted

    ▼
User moves mouse away
    │
    ▼
Cesium emits 'mouseout' event
    │
    ▼
Event handler: graphic.on('mouseout', ...)
    │
    ├─ Call hideMarkerTooltip() (100ms delay)
    │   └─ Set tooltipVisible = false
    │
    └─ Call dehighlightMarker(graphic)
        │
        ├─ marker.style.scale = 1.0
        ├─ marker.style.image = originalImage (red)
        └─ marker.style.label.color = white

Result: Tooltip gone, marker back to normal
```

### Editing a Location

```
User clicks on highlighted marker
    │
    ▼
Cesium emits 'click' event
    │
    ▼
Event handler checks pendingDeleteMarker flag
    │
    ├─ If true → deleteMarker(marker)
    └─ If false → openEditModal(marker)
        │
        ├─ Store marker reference: currentEditingMarker = marker
        ├─ Extract position: lat, lng
        ├─ Extract attributes: name, city, description, address fields
        ├─ Populate modalMarkerData
        ├─ Set isModalOpen = true
        │
        ▼
    MarkerModal opens with pre-filled data
        │
        ├─ User can see all current values
        ├─ Live address preview shows current format
        └─ User modifies fields
            │
            ▼
        User clicks "✅ Lưu"
            │
            ▼
        MarkerModal emits @save(data)
            │
            ▼
        Mars3DMap: saveMarkerFromModal(data)
            │
            ├─ Check currentEditingMarker exists
            │
            ▼
            updateMarker(marker, data)
                │
                ├─ Update marker.attr with new data
                ├─ Update marker.style.label.text = data.name
                ├─ PUT to /api/landmarks/:id
                │   └─ Returns: updated landmark
                │
                └─ showInfo("✅ Đã cập nhật marker...")
                │
                ▼
        closeModal()
            │
            ├─ isModalOpen = false
            ├─ currentEditingMarker = null
            ├─ hideMarkerTooltip()
            ├─ dehighlightMarker()
            └─ resetMapCursor()

Result: Marker updated, modal closed, tooltip cleared
```

---

## Data Transformation Examples

### Creating Marker Object

```javascript
// Input: User fills form
Input: {
  name: "Hồ Hoàn Kiếm",
  lat: 21.028511,
  lng: 105.804817,
  city: "Hà Nội",
  description: "Famous lake",
  houseNumberOrOfficeName: "12",
  ward: "Phường Hoàn Kiếm",
  district: "Quận Hoàn Kiếm",
  province: "Thành phố Hà Nội",
  country: "Vietnam"
}

    ▼ Frontend Validation
    ├─ name: ✓ not empty
    ├─ ward: ✓ not empty
    ├─ district: ✓ not empty
    ├─ province: ✓ not empty
    └─ country: ✓ default to "Vietnam"

    ▼ POST to Backend

// Backend Receives
Backend Input: {
  name: "Hồ Hoàn Kiếm",
  lat: 21.028511,
  lng: 105.804817,
  city: "Hà Nội",
  description: "Famous lake",
  houseNumberOrOfficeName: "12",
  ward: "Phường Hoàn Kiếm",
  district: "Quận Hoàn Kiếm",
  province: "Thành phố Hà Nội",
  country: "Vietnam"
}

    ▼ Backend Validation
    ├─ name: ✓ required
    ├─ ward: ✓ required
    ├─ district: ✓ required
    ├─ province: ✓ required
    └─ country: ✓ auto-set if not provided

    ▼ Build fullAddress
    buildFullAddress(landmark):
    ├─ If houseNumberOrOfficeName: "12 "
    ├─ If ward: "+ Phường Hoàn Kiếm, "
    ├─ If district: "+ Quận Hoàn Kiếm, "
    ├─ If province: "+ Thành phố Hà Nội, "
    ├─ If country: "+ Vietnam"
    └─ Result: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam"

    ▼ Database Insert
INSERT INTO landmarks (
  name, lat, lng, city, description,
  house_number_or_office_name, ward, district, province, country
) VALUES (...)
RETURNING *

    ▼ Backend Response
{
  id: 123,
  name: "Hồ Hoàn Kiếm",
  lat: 21.028511,
  lng: 105.804817,
  city: "Hà Nội",
  description: "Famous lake",
  house_number_or_office_name: "12",
  ward: "Phường Hoàn Kiếm",
  district: "Quận Hoàn Kiếm",
  province: "Thành phố Hà Nội",
  country: "Vietnam",
  fullAddress: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam",
  created_at: "2025-12-18T10:00:00Z",
  updated_at: "2025-12-18T10:00:00Z"
}

    ▼ Frontend: Create Marker Graphic
createMarkerGraphic({
  id: 123,
  name: "Hồ Hoàn Kiếm",
  lat: 21.028511,
  lng: 105.804817,
  houseNumberOrOfficeName: "12",
  ward: "Phường Hoàn Kiếm",
  district: "Quận Hoàn Kiếm",
  province: "Thành phố Hà Nội",
  country: "Vietnam",
  fullAddress: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam",
  ...
})

    ▼ Marker Graphic Created
Cesium.BillboardEntity {
  position: [105.804817, 21.028511, 0],
  style: {
    image: "data:image/svg+xml,...", // red pin
    scale: 1,
    label: {
      text: "Hồ Hoàn Kiếm",
      color: "#ffffff",
      ...
    }
  },
  attr: {
    id: 123,
    name: "Hồ Hoàn Kiếm",
    fullAddress: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam",
    houseNumberOrOfficeName: "12",
    ward: "Phường Hoàn Kiếm",
    district: "Quận Hoàn Kiếm",
    province: "Thành phố Hà Nội",
    country: "Vietnam",
    originalScale: 1,
    originalImage: "data:image/svg+xml,...", // red
    highlightImage: "data:image/svg+xml,...", // gold
    ...
  }
}

    ▼ Marker Added to Layer
markerLayer.addGraphic(graphic)
markers.value.push(graphic)

Result: Marker visible on map!
```

---

## Visual State Changes

### Marker Highlighting Animation

```
NORMAL STATE                HIGHLIGHTED STATE       BACK TO NORMAL
─────────────────          ──────────────────      ──────────────

Scale: 1.0                 Scale: 1.3              Scale: 1.0
Size: 48x48px      →       Size: 62x62px    →      Size: 48x48px
Color: RED         →       Color: GOLD      →      Color: RED
Label: White       →       Label: Gold      →      Label: White

Pin Icon:          →       Pin Icon:        →      Pin Icon:
🔴 (small)                🟡 (large)               🔴 (small)

Label:             →       Label:           →      Label:
"名前"                    "名前"                   "名前"
(white text)             (golden text)           (white text)

Timeline:
0ms      100ms    200ms   300ms   400ms    500ms
│────────▼────────────────────────────▼─────────
        Mouse enters             Mouse leaves
        (showMarkerTooltip)      (hideMarkerTooltip +
         highlightMarker)         dehighlightMarker)
```

---

## Error Handling & Validation Flow

```
User Action
    │
    ▼
Frontend Validation
    ├─ Check name: not empty? ─── No ─→ Alert & Stop
    ├─ Check ward: not empty?    ─── No ─→ Alert & Stop
    ├─ Check district: not empty? ─── No ─→ Alert & Stop
    ├─ Check province: not empty? ─── No ─→ Alert & Stop
    └─ All checks pass ─→ Continue
        │
        ▼
    Backend Request (POST/PUT)
        │
        ▼
    Backend Validation
        ├─ Validate name ─────── Fail ─→ 400 Bad Request
        ├─ Validate ward ─────── Fail ─→ 400 Bad Request
        ├─ Validate district ─── Fail ─→ 400 Bad Request
        ├─ Validate province ─── Fail ─→ 400 Bad Request
        ├─ All checks pass ─────→ Continue
        └─ Auto-set country if missing
            │
            ▼
        Database Operation
            ├─ INSERT/UPDATE ─── Success ─→ Return 200 + data
            └─ Database error ──────────→ 500 Server Error
                │
                ▼
            Frontend Error Handler
                ├─ Log to console
                ├─ Show error toast
                └─ Keep modal open for retry

Result: User sees error message and can fix
```

---

## Performance Optimization Points

```
OPTIMIZATION          IMPLEMENTATION                    BENEFIT
─────────────────────────────────────────────────────────────────
Lazy Loading          requestIdleCallback schedule      ✓ Non-blocking
                      static content                    ✓ Smooth startup

API Response          fullAddress computed on server    ✓ Reduced data
Format                returned in single field          ✓ Better UX

Tooltip Delay         100ms delay on hide               ✓ No flicker
                      clearTimeout on new show          ✓ Clean state

Marker State          Only 1 highlighted at a time      ✓ Memory efficient
Management            Previous restored before new      ✓ No stale state

Event Handling        Direct graphic.on() listeners    ✓ No event capture
                      No bubbling through map          ✓ Clean isolation

Conditional Events    Mobile vs Desktop detection      ✓ Reduced listeners
                      Touch/Hover events only when     ✓ Better UX
                      applicable

Component Mounting    AddressTooltip teleported        ✓ Proper z-index
                      MarkerModal teleported           ✓ No CSS conflicts
                      No DOM nesting issues            ✓ Clean structure
```

This comprehensive architecture ensures efficient, maintainable, and user-friendly location management.
