# Location Management System - Setup & Testing Guide

## Overview

This document provides comprehensive instructions for the new location management system with administrative address fields, tooltip display, and marker highlighting.

## What Was Implemented

### Backend Changes

#### 1. Database Schema Updates (`backend/migrate.js` - NEW)
- **New Fields Added:**
  - `houseNumberOrOfficeName` (VARCHAR 255, optional)
  - `ward` (VARCHAR 255, required)
  - `district` (VARCHAR 255, required)
  - `province` (VARCHAR 255, required)
  - `country` (VARCHAR 100, default='Vietnam')
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **Migration Features:**
  - Creates table if doesn't exist
  - Adds missing columns if table exists
  - Preserves existing data
  - Sets sensible defaults

#### 2. Updated CRUD Routes (`backend/routes/landmarks.js`)
- **GET /api/landmarks**: Returns all landmarks with `fullAddress` computed field
- **POST /api/landmarks**: 
  - Validates required fields (name, ward, district, province)
  - Auto-sets country = 'Vietnam' if not provided
  - Returns saved landmark with fullAddress
  
- **PUT /:id**: 
  - Updates landmark with all fields
  - Validates required fields
  - Returns updated landmark with fullAddress
  
- **DELETE /:id**: Deletes landmark by ID
- **POST /bulk-save**: Bulk insert with address fields support

#### 3. Helper Function (`buildFullAddress`)
Formats: `houseNumber, ward, district, province, country`
Example: `12A Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam`

---

### Frontend Changes

#### 1. Updated MarkerModal.vue
**New Features:**
- Organized form with 3 sections:
  - 📍 Thông tin cơ bản (name, description)
  - 🏠 Địa chỉ (houseNumberOrOfficeName, ward, district, province, country, city)
  - 🗺️ Tọa độ (read-only lat/lng display)
  
- **Form Validation:**
  - Required: name, ward, district, province
  - Optional: houseNumberOrOfficeName, city
  - Auto-fills country = 'Vietnam'
  
- **Live Address Preview:**
  - Shows formatted full address as user types
  - Updates in real-time

- **Responsive Design:**
  - Grid layout for address fields (2 columns on desktop, 1 on mobile)
  - Professional gradient background
  - Enhanced styling with section headers

#### 2. New AddressTooltip.vue Component
**Features:**
- Displays on hover (desktop) and long-press (mobile)
- Shows:
  - 📍 Location name with icon
  - Full formatted address
  - Description (if available)
  - Coordinates (lat/lng with precision)
  
- **Styling:**
  - Dark theme with gradient background
  - Smooth fade-in animation
  - Auto-positioning within viewport
  - Responsive for mobile devices
  
- **Animation:**
  - Fade-in effect on show
  - Smooth positioning
  - Proper z-index layering

#### 3. Enhanced Mars3DMap.vue
**New State Variables:**
```javascript
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipLandmark = ref({});
const isMobileBrowser = ref(/iPhone|iPad|Android|webOS/i.test(navigator.userAgent));
let currentHighlightedMarker = null;
```

**Enhanced createMarkerGraphic() Function:**
- Stores full address data in marker attributes
- Includes two pin icons (normal red, highlight gold)
- Supports hover events (desktop) → tooltip + highlight
- Supports long-press events (mobile) → tooltip + highlight

**New Helper Functions:**
```javascript
function showMarkerTooltip(landmark, position)    // Display tooltip
function hideMarkerTooltip()                      // Hide tooltip with delay
function highlightMarker(marker)                  // Scale up, change color
function dehighlightMarker(marker)                // Restore original state
```

**Marker Interaction Flow:**
1. **Hover/Long-press**: 
   - Show tooltip with full address
   - Highlight marker (scale 1.3x, golden color)
   
2. **Leave/End long-press**: 
   - Hide tooltip (with 100ms delay)
   - Restore marker to original state
   
3. **Click**: 
   - Open edit modal
   - Restore highlight state

**Updated Functions:**
- `createNewMarker()`: Now saves all address fields
- `updateMarker()`: Updates all address fields
- `openEditModal()`: Populates all address fields
- `closeModal()`: Cleans up tooltip and highlight state

---

## Setup Instructions

### Step 1: Backup Current Database (Optional)
```powershell
# If using PostgreSQL, create backup
# Replace connection string as needed
```

### Step 2: Run Database Migration
```powershell
cd "d:\ICDingHoc\Project\Mars3D Vue 3\backend"
npm run migrate
```

**Expected Output:**
```
✅ Running database migrations...
✓ landmarks table already exists
📝 Adding house_number_or_office_name column...
✅ house_number_or_office_name column added
📝 Adding ward column...
✅ ward column added
... (other columns) ...
✅ All migrations completed successfully!
```

### Step 3: Start Backend Server
```powershell
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Start Frontend Development Server
```powershell
cd frontend
npm run dev
# Frontend runs on http://localhost:8081 (or configured port)
```

---

## Testing Checklist

### Test 1: Add New Location with Address Fields
**Steps:**
1. Click "➕ Thêm Marker" button
2. Click on map to place marker
3. Modal opens with blank form
4. Fill in:
   - Tên địa điểm: "Hồ Hoàn Kiếm"
   - Số nhà: "12"
   - Phường/Xã: "Phường Hoàn Kiếm"
   - Quận/Huyện: "Quận Hoàn Kiếm"
   - Tỉnh/Thành phố: "Thành phố Hà Nội"
   - (Country auto-sets to "Vietnam")
   - Mô tả: "Famous lake in Hanoi"

**Expected Results:**
- ✅ Live address preview updates as you type
- ✅ Full address shows: "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam"
- ✅ Marker appears on map after save
- ✅ Backend receives all fields correctly
- ✅ Console shows successful POST

### Test 2: Hover Tooltip (Desktop)
**Steps:**
1. Hover mouse over marker (without clicking)
2. Wait 200ms for tooltip to appear

**Expected Results:**
- ✅ Tooltip appears with:
  - 📍 Marker name
  - Full address (formatted)
  - Description (if provided)
  - Coordinates with precision
- ✅ Marker scales up (1.3x)
- ✅ Marker icon changes to golden color
- ✅ Label text becomes golden
- ✅ Tooltip stays visible while hovering

**Moving away:**
- ✅ Tooltip fades out within 100ms
- ✅ Marker returns to original size and color
- ✅ No tooltip jumps or flicker

### Test 3: Long-Press Tooltip (Mobile/Touch)
**Steps:**
1. On touch device or mobile emulator
2. Long-press (hold finger) on marker for ~500ms
3. Release finger

**Expected Results:**
- ✅ Tooltip appears after 500ms hold
- ✅ All tooltip content visible
- ✅ Marker highlighted
- ✅ Tooltip positioned in center of screen (mobile adjustment)
- ✅ Tooltip has responsive sizing

### Test 4: Edit Existing Location
**Steps:**
1. Hover over marker to see tooltip
2. Click on marker to open modal
3. Modal should show all existing data
4. Change one field (e.g., description)
5. Click Save

**Expected Results:**
- ✅ Modal shows all address fields pre-filled
- ✅ Full address displays correctly
- ✅ PUT request sent to backend
- ✅ Marker updates on map
- ✅ Marker tooltip shows updated info
- ✅ Database updates all fields

### Test 5: Delete Location
**Steps:**
1. Click "🗑️ Xóa Marker" button
2. Marker cursor changes to "not-allowed" symbol
3. Click on marker to delete
4. Confirm deletion

**Expected Results:**
- ✅ Marker removed from map
- ✅ DELETE request sent to backend
- ✅ Database removes location
- ✅ Tooltip hidden immediately
- ✅ No errors in console

### Test 6: Page Reload Persistence
**Steps:**
1. Add multiple locations with address data
2. Refresh page (F5 or Ctrl+R)
3. Wait for data to load

**Expected Results:**
- ✅ All markers reappear on map
- ✅ All address fields preserved
- ✅ Tooltips show correct full addresses
- ✅ No duplicate markers
- ✅ Console shows "Loaded X landmarks from backend"

### Test 7: Validation
**Steps - Missing Required Field:**
1. Click "➕ Thêm Marker"
2. Click map to open modal
3. Fill in only name and description (skip address fields)
4. Try to save

**Expected Results:**
- ✅ Alert: "⚠️ Vui lòng nhập Phường/Xã"
- ✅ Modal remains open
- ✅ No POST request sent
- ✅ Focus on required field

### Test 8: Marker State Management
**Steps:**
1. Hover over marker to highlight it
2. Without moving mouse, click to edit
3. Modal opens
4. Close modal without saving

**Expected Results:**
- ✅ Marker highlight cleared when modal closes
- ✅ Tooltip hidden when modal closes
- ✅ Marker restored to original state
- ✅ No visual artifacts

---

## API Endpoint Examples

### GET /api/landmarks
```json
[
  {
    "id": 1,
    "name": "Hồ Hoàn Kiếm",
    "lat": 21.0285,
    "lng": 105.8048,
    "city": "Hà Nội",
    "description": "Famous lake",
    "house_number_or_office_name": "12",
    "ward": "Phường Hoàn Kiếm",
    "district": "Quận Hoàn Kiếm",
    "province": "Thành phố Hà Nội",
    "country": "Vietnam",
    "fullAddress": "12 Phường Hoàn Kiếm, Quận Hoàn Kiếm, Thành phố Hà Nội, Vietnam",
    "created_at": "2025-12-18T10:00:00Z",
    "updated_at": "2025-12-18T10:00:00Z"
  }
]
```

### POST /api/landmarks
**Request:**
```json
{
  "name": "Hồ Hoàn Kiếm",
  "lat": 21.0285,
  "lng": 105.8048,
  "city": "Hà Nội",
  "description": "Famous lake",
  "houseNumberOrOfficeName": "12",
  "ward": "Phường Hoàn Kiếm",
  "district": "Quận Hoàn Kiếm",
  "province": "Thành phố Hà Nội",
  "country": "Vietnam"
}
```

**Response:** Same as GET + id, created_at, updated_at, fullAddress

### PUT /api/landmarks/:id
Same payload structure as POST

### DELETE /api/landmarks/:id
Returns: `{ success: true, deleted: {...} }`

---

## Troubleshooting

### Issue: Database connection fails
**Solution:** 
- Ensure internet connection (Supabase hosted)
- Check DATABASE_URL in .env
- Run `npm run db:check` to verify connectivity

### Issue: Tooltip not showing
**Possible Causes:**
- Map not fully initialized: Check `isMapReady` state
- z-index issue: Check if other elements overlap
- **Solution:** Check browser console for errors

### Issue: Marker not updating after edit
**Solution:**
- Check browser DevTools Network tab for PUT request
- Verify backend logs for errors
- Check database for update confirmation

### Issue: Coordinates showing as N/A in tooltip
**Solution:**
- Verify landmark object has lat/lng properties
- Check data format: lat/lng should be numbers
- Ensure createMarkerGraphic receives landmark data

### Issue: Mobile long-press not working
**Solution:**
- Test on actual mobile or mobile emulator
- Ensure pointerdown/pointerup events supported
- Check if touch-action CSS prevents default behavior

---

## Code Changes Summary

| File | Change | Type |
|------|--------|------|
| `backend/migrate.js` | NEW | Database migration script |
| `backend/routes/landmarks.js` | UPDATED | CRUD routes with address validation |
| `backend/package.json` | UPDATED | Added npm migrate script |
| `frontend/src/components/MarkerModal.vue` | UPDATED | Added address form fields |
| `frontend/src/components/AddressTooltip.vue` | NEW | Tooltip component |
| `frontend/src/components/Mars3DMap.vue` | UPDATED | Marker handling with tooltips/highlights |

---

## File Locations

**Backend Migration:**
- Location: `d:\ICDingHoc\Project\Mars3D Vue 3\backend\migrate.js`
- Run: `npm run migrate`

**Updated Backend Routes:**
- Location: `d:\ICDingHoc\Project\Mars3D Vue 3\backend\routes\landmarks.js`
- Updates: GET, POST, PUT, DELETE endpoints

**Updated Frontend Components:**
- Modal: `frontend/src/components/MarkerModal.vue`
- Tooltip: `frontend/src/components/AddressTooltip.vue` (NEW)
- Map: `frontend/src/components/Mars3DMap.vue`

---

## Performance Considerations

- **Tooltip rendering**: Uses Teleport for proper stacking context
- **Marker highlighting**: Efficient re-styling without recreating graphics
- **State management**: Tooltip hidden automatically after mouseleave
- **Mobile optimization**: Uses `isMobileBrowser` detection for conditional event handling
- **Database**: Address format built server-side to reduce frontend computation

---

## Next Steps (Optional Enhancements)

1. **Address autocomplete** - Integrate Google Maps Places API
2. **Batch operations** - Multi-select and bulk edit addresses
3. **Search/filter** - Find locations by district or province
4. **Export** - Export all locations with full addresses to CSV/JSON
5. **Import** - Bulk upload locations from spreadsheet
6. **History** - Track address changes with versioning

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Review backend logs: `npm run dev` output
3. Verify database connection: `npm run db:check`
4. Check network requests in DevTools
