import express from 'express';
import { sql } from '../config/db.js';

const router = express.Router();

// Helper function to build full address string
function buildFullAddress(landmark) {
  const parts = [];
  if (landmark.house_number_or_office_name) {
    parts.push(landmark.house_number_or_office_name);
  }
  if (landmark.ward) parts.push(landmark.ward);
  if (landmark.district) parts.push(landmark.district);
  if (landmark.province) parts.push(landmark.province);
  if (landmark.country) parts.push(landmark.country);
  return parts.join(', ');
}


router.get('/', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM landmarks ORDER BY id ASC`;
    // Add full address to each landmark
    const landmarksWithAddress = rows.map(landmark => ({
      ...landmark,
      fullAddress: buildFullAddress(landmark)
    }));
    res.json(landmarksWithAddress);
  } catch (err) {
    console.error('❌ db error:', err.message || err);
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

router.post('/', async (req, res) => {
  const { 
    name, lat, lng, city, description, 
    houseNumberOrOfficeName, ward, district, province, country 
  } = req.body;
  
  // Validate required fields
  if (!name) return res.status(400).json({ error: 'missing name' });
  if (!ward) return res.status(400).json({ error: 'missing ward' });
  if (!district) return res.status(400).json({ error: 'missing district' });
  if (!province) return res.status(400).json({ error: 'missing province' });

  try {
    const finalCountry = country || 'Vietnam';
    const result = await sql`
      INSERT INTO landmarks (
        name, lat, lng, city, description, 
        house_number_or_office_name, ward, district, province, country
      ) VALUES (
        ${name}, ${lat}, ${lng}, ${city}, ${description}, 
        ${houseNumberOrOfficeName || null}, ${ward}, ${district}, ${province}, ${finalCountry}
      ) RETURNING *
    `;
    
    // Format response with full address
    const landmark = result[0];
    res.json({
      ...landmark,
      fullAddress: buildFullAddress(landmark)
    });
  } catch (err) {
    console.error('❌ db insert error:', err.message || err);
    // Handle unique constraint (name, lat, lng) for duplicate markers
    if (err && err.code === '23505') {
      return res.status(409).json({
        error: 'duplicate',
        message: 'Địa điểm đã tồn tại (trùng name + lat + lng)'
      });
    }
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Update a landmark
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    name, lat, lng, city, description, 
    houseNumberOrOfficeName, ward, district, province, country 
  } = req.body;
  
  // Validate required fields if provided
  if (name === '') return res.status(400).json({ error: 'name cannot be empty' });
  if (ward === '') return res.status(400).json({ error: 'ward cannot be empty' });
  if (district === '') return res.status(400).json({ error: 'district cannot be empty' });
  if (province === '') return res.status(400).json({ error: 'province cannot be empty' });

  try {
    // Get current landmark to preserve values not being updated
    const current = await sql`SELECT * FROM landmarks WHERE id = ${id}`;
    if (current.length === 0) {
      return res.status(404).json({ error: 'Landmark not found' });
    }

    const finalCountry = country ?? current[0].country ?? 'Vietnam';
    const updateName = name ?? current[0].name;
    const updateLat = lat ?? current[0].lat;
    const updateLng = lng ?? current[0].lng;
    const updateCity = city ?? current[0].city;
    const updateDescription = description ?? current[0].description;
    const updateHouseNumber = houseNumberOrOfficeName ?? current[0].house_number_or_office_name;
    const updateWard = ward ?? current[0].ward;
    const updateDistrict = district ?? current[0].district;
    const updateProvince = province ?? current[0].province;

    const result = await sql`
      UPDATE landmarks SET 
        name = ${updateName},
        lat = ${updateLat},
        lng = ${updateLng},
        city = ${updateCity},
        description = ${updateDescription},
        house_number_or_office_name = ${updateHouseNumber},
        ward = ${updateWard},
        district = ${updateDistrict},
        province = ${updateProvince},
        country = ${finalCountry},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} 
      RETURNING *
    `;
    
    if (result.length === 0) return res.status(404).json({ error: 'Landmark not found' });
    
    // Format response with full address
    const landmark = result[0];
    res.json({
      ...landmark,
      fullAddress: buildFullAddress(landmark)
    });
  } catch (err) {
    console.error('❌ db update error:', err.message || err);
    if (err && err.code === '23505') {
      return res.status(409).json({
        error: 'duplicate',
        message: 'Địa điểm đã tồn tại (trùng name + lat + lng)'
      });
    }
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Delete a landmark
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`DELETE FROM landmarks WHERE id = ${id} RETURNING *`;
    if (result.length === 0) return res.status(404).json({ error: 'Landmark not found' });
    res.json({ success: true, deleted: result[0] });
  } catch (err) {
    console.error('❌ db delete error:', err.message || err);
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

// Bulk save all landmarks (replaces all data)
router.post('/bulk-save', async (req, res) => {
  const { landmarks } = req.body;
  
  if (!Array.isArray(landmarks)) {
    return res.status(400).json({ error: 'landmarks must be an array' });
  }

  try {
    // Clear existing data
    await sql`DELETE FROM landmarks`;
    
    // Insert new data
    let inserted = 0;
    for (const landmark of landmarks) {
      const { 
        name, lat, lng, city, description, 
        houseNumberOrOfficeName, ward, district, province, country 
      } = landmark;
      
      if (name && lat != null && lng != null) {
        const finalCountry = country || 'Vietnam';
        const finalWard = ward || '';
        const finalDistrict = district || '';
        const finalProvince = province || '';
        
        await sql`
          INSERT INTO landmarks (
            name, lat, lng, city, description, 
            house_number_or_office_name, ward, district, province, country
          ) VALUES (
            ${name}, ${lat}, ${lng}, ${city || null}, ${description || null}, 
            ${houseNumberOrOfficeName || null}, ${finalWard}, ${finalDistrict}, ${finalProvince}, ${finalCountry}
          )
        `;
        inserted++;
      }
    }
    
    res.json({ success: true, inserted, message: `Đã lưu ${inserted} địa điểm vào database` });
  } catch (err) {
    console.error('❌ bulk save error:', err.message || err);
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});

export default router;
