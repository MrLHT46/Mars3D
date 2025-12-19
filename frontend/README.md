# 🌍 Mars3D + Vue 3 - Hệ thống Bản đồ 3D Tương tác

Ứng dụng web GIS (Geographic Information System) chuyên nghiệp kết hợp thư viện **Mars3D** (dựa trên Cesium) với framework **Vue 3**, cung cấp trải nghiệm bản đồ 3D mượt mà và đầy đủ tính năng cho việc quản lý, phân tích và trực quan hóa dữ liệu địa lý.

---
# Lưu trữ: https://app.eofactory.ai/workspaces

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Tính năng chính](#-tính-năng-chính)
- [Nghiệp vụ và Use Cases](#-nghiệp-vụ-và-use-cases)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API và Tích hợp](#-api-và-tích-hợp)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🎯 Tổng quan

### Giới thiệu
Dự án **Mars3D + Vue 3** là một nền tảng bản đồ 3D tương tác được xây dựng để phục vụ các nhu cầu:
- 🗺️ Hiển thị và quản lý dữ liệu địa lý trên quả địa cầu 3D
- 📍 Đánh dấu và quản lý các điểm quan tâm (POI - Points of Interest)
- 📏 Đo đạc khoảng cách, diện tích, độ cao trực tiếp trên bản đồ
- ✏️ Vẽ và chỉnh sửa các hình dạng địa lý (polygon, polyline, circle)
- 🏗️ Hiển thị các mô hình 3D (buildings, structures, objects)
- 🎬 Tạo các tour và animation camera để giới thiệu địa điểm
- 📊 Phân tích và trực quan hóa dữ liệu không gian

### Mục đích sử dụng
- **Quản lý đô thị**: Quy hoạch, giám sát hạ tầng, quản lý tài sản công
- **Du lịch**: Tạo tour ảo, giới thiệu địa điểm du lịch
- **Giáo dục**: Dạy và học địa lý, lịch sử, môi trường
- **Quản lý tài nguyên**: Theo dõi đất đai, rừng, nguồn nước
- **Logistics**: Lập kế hoạch tuyến đường, quản lý kho bãi
- **Bất động sản**: Giới thiệu dự án, phân tích vị trí
- **Ứng phó khẩn cấp**: Lập kế hoạch sơ tán, quản lý thiên tai

---

## 🛠️ Công nghệ sử dụng

### Core Technologies
- **Frontend Framework**: Vue 3 (Composition API)
- **3D Engine**: Mars3D v3.10.7 (dựa trên Cesium v1.134.1)
- **Build Tool**: Vite v7.1.12
- **Language**: JavaScript (ES6+)

### Libraries & Tools
- `@vitejs/plugin-vue`: static assets (Cesium workers, assets) Vue plugin cho Vite
- `vite-plugin-static-copy`: Copy
- Mars3D CSS & Cesium Widgets CSS

### Basemaps Supported
- Google Satellite
- OpenStreetMap (OSM)
- ArcGIS Imagery
- Bing Maps

---

## 💻 Yêu cầu hệ thống

### Phát triển (Development)
- **Node.js**: >= 16.x (khuyến nghị LTS 18.x hoặc 20.x)
- **NPM**: >= 8.x hoặc Yarn >= 1.22.x
- **RAM**: >= 4GB
- **Ổ cứng**: >= 2GB trống
- **GPU**: Card đồ họa hỗ trợ WebGL 2.0

### Trình duyệt (Browser)
- Chrome >= 90
- Firefox >= 88
- Edge >= 90
- Safari >= 14
- **Không hỗ trợ**: Internet Explorer

### Kết nối mạng
- Cần kết nối internet để tải basemaps (Google, OSM, etc.)
- Tải GeoJSON từ external sources
- Load Cesium assets và workers

---

## 📦 Cài đặt

### Bước 1: Clone hoặc Download dự án
```bash
# Clone từ Git (nếu có)
git clone <repository-url>
cd "Mars3D + Vue 3"

# Hoặc download và giải nén vào thư mục
cd "d:\ICDingHoc\Project\Mars3D + Vue 3"
```

### Bước 2: Cài đặt dependencies
```powershell
npm install
```

**Các packages sẽ được cài đặt:**
- vue
- mars3d
- cesium
- vite
- @vitejs/plugin-vue
- vite-plugin-static-copy

### Bước 3: Verify installation
```powershell
npm list mars3d
npm list vue
npm list vite
```

---

## 🚀 Chạy ứng dụng

### Development Mode
```powershell
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:8081/** (hoặc port khác nếu 8081 bận)

### Production Build
```powershell
npm run build
```

Kết quả build sẽ nằm trong thư mục `dist/`

### Preview Production Build
```powershell
npm run preview
```

---

## 🎨 Tính năng chính

### 1. 📍 Quản lý Markers (Điểm đánh dấu)
**Chức năng:**
- Thêm markers tại bất kỳ vị trí nào trên bản đồ
- Hiển thị icon và label tùy chỉnh
- Popup thông tin chi tiết khi click
- Ẩn/hiện tất cả markers
- Fly-to animation đến marker

**Nghiệp vụ áp dụng:**
- Đánh dấu địa điểm du lịch, di tích lịch sử
- Vị trí cửa hàng, chi nhánh công ty
- Điểm giám sát môi trường
- Vị trí sự cố, sự kiện

**API:**
```javascript
// Thêm marker
const graphic = new mars3d.graphic.BillboardEntity({
  position: [lng, lat, alt],
  style: {
    image: "url/to/icon.png",
    scale: 0.5,
    label: { text: "Tên địa điểm" }
  }
});
graphicLayer.addGraphic(graphic);
```

### 2. 📏 Công cụ Đo đạc
**Chức năng:**
- **Đo khoảng cách**: Đo khoảng cách giữa 2 hoặc nhiều điểm (m, km)
- **Đo diện tích**: Vẽ polygon và tính diện tích (m², km²)
- **Đo độ cao**: Đo chênh lệch độ cao giữa 2 điểm

**Nghiệp vụ áp dụng:**
- Tính diện tích đất đai, khu vực xây dựng
- Đo khoảng cách vận chuyển
- Phân tích địa hình
- Quy hoạch hạ tầng

**Cách sử dụng:**
1. Click nút "📏 Đo khoảng cách" / "📊 Đo diện tích"
2. Click các điểm trên bản đồ
3. Double-click để kết thúc đo đạc
4. Kết quả hiển thị ngay trên bản đồ

### 3. ✏️ Công cụ Vẽ hình
**Chức năng:**
- **Polygon**: Vẽ đa giác tùy ý
- **Circle**: Vẽ hình tròn
- **Rectangle**: Vẽ hình chữ nhật
- **Polyline**: Vẽ đường, tuyến đường

**Nghiệp vụ áp dụng:**
- Vẽ ranh giới hành chính
- Đánh dấu khu vực nguy hiểm, cấm
- Quy hoạch khu đô thị
- Vẽ tuyến đường giao thông

**Tính năng:**
- Màu sắc tự động hoặc tùy chỉnh
- Tính diện tích tự động cho polygon
- Outline và fill tùy chỉnh
- Clamp to ground

### 4. 🏗️ Hiển thị 3D Models
**Chức năng:**
- Thêm các hình 3D: Box, Cylinder, Cone, Ellipsoid
- Tùy chỉnh kích thước, màu sắc, độ trong suốt
- Label và outline

**Nghiệp vụ áp dụng:**
- Mô phỏng tòa nhà, công trình
- Hiển thị cột điện, cây cối
- Đối tượng môi trường 3D
- Marker 3D đặc biệt

**API:**
```javascript
// Thêm Box 3D
const box = new mars3d.graphic.BoxEntity({
  position: [lng, lat, alt],
  style: {
    dimensions: new mars3d.Cesium.Cartesian3(50, 50, 100),
    color: "rgba(255, 0, 0, 0.7)"
  }
});
```

### 5. 🗺️ Quản lý Basemap
**Chức năng:**
- Chuyển đổi nhanh giữa 4 loại bản đồ nền
- Tùy chỉnh độ mờ của layer Vietnam
- Bật/tắt terrain 3D
- Hiển thị/ẩn labels và grid

**Basemaps:**
- **Google Satellite**: Ảnh vệ tinh độ phân giải cao
- **OpenStreetMap**: Bản đồ mở cộng đồng
- **ArcGIS Imagery**: Dữ liệu Esri
- **Bing Maps**: Bản đồ Microsoft

### 6. 🎬 Animation & Camera Control
**Chức năng:**
- **Camera Tour**: Tour tự động qua 10 địa điểm nổi tiếng VN
- **Xoay 360°**: Camera xoay quanh điểm hiện tại
- **Reset Camera**: Về vị trí mặc định (Hà Nội)
- **Fly-to Animation**: Bay đến vị trí với hiệu ứng mượt

**Địa điểm trong Tour:**
1. Hồ Hoàn Kiếm, Hà Nội
2. Văn Miếu - Quốc Tử Giám
3. Lăng Chủ tịch Hồ Chí Minh
4. Nhà hát Lớn Hà Nội
5. Cầu Long Biên
6. Vịnh Hạ Long, Quảng Ninh
7. Phố cổ Hội An, Quảng Nam
8. Vườn quốc gia Phong Nha - Kẻ Bàng
9. Đà Lạt, Lâm Đồng
10. TP. Hồ Chí Minh

### 7. 🔍 Tìm kiếm Địa điểm
**Chức năng:**
- Tìm kiếm theo tên địa điểm
- Tìm theo tên thành phố
- Auto fly-to khi tìm thấy
- Hiển thị thông báo kết quả

**Cách sử dụng:**
1. Gõ tên địa điểm vào ô search (vd: "Hội An", "Đà Lạt")
2. Nhấn Enter hoặc click 🔍
3. Camera sẽ bay đến địa điểm

### 8. 📸 Screenshot & Export
**Chức năng:**
- **Chụp màn hình**: Export ảnh PNG của bản đồ hiện tại
- **Export JSON**: Lưu tất cả markers, polylines, models ra file JSON
- **Import JSON**: Load dữ liệu từ file đã export

**Định dạng JSON Export:**
```json
{
  "markers": [
    { "type": "marker", "name": "Tên", "position": [lng, lat, alt] }
  ],
  "polylines": [
    { "type": "polyline", "positions": [[lng1,lat1,alt1], ...] }
  ],
  "models": [
    { "type": "3dmodel", "name": "Box", "position": [lng, lat, alt] }
  ]
}
```

### 9. 📊 Stats & Monitoring
**Real-time Statistics:**
- 📍 Số lượng Markers
- 📏 Số lượng Đường vẽ
- 🏗️ Số lượng 3D Models
- ⬟ Số lượng Polygons

Hiển thị ở góc dưới bên trái màn hình

### 10. 🎚️ Layer Control
**Chức năng:**
- Toggle Terrain 3D
- Toggle Labels (nhãn địa danh)
- Toggle Grid (lưới tọa độ)
- Slider điều chỉnh độ mờ Vietnam layer

---

## 💼 Nghiệp vụ và Use Cases

### Use Case 1: Quản lý Du lịch
**Kịch bản:**
Công ty du lịch muốn tạo tour ảo giới thiệu các địa điểm nổi tiếng

**Giải pháp:**
1. Thêm markers tại các địa điểm du lịch
2. Thêm thông tin chi tiết vào popup
3. Sử dụng Camera Tour để tạo presentation tự động
4. Vẽ đường di chuyển giữa các điểm
5. Export dữ liệu để tái sử dụng

**Lợi ích:**
- Trực quan hóa lịch trình tour
- Khách hàng xem trước địa điểm
- Tạo marketing materials hấp dẫn

### Use Case 2: Quy hoạch Đô thị
**Kịch bản:**
Sở Xây dựng cần quản lý và quy hoạch khu vực đô thị

**Giải pháp:**
1. Vẽ polygon ranh giới các khu vực
2. Thêm 3D models mô phỏng tòa nhà
3. Đo diện tích đất dự án
4. Đánh dấu hạ tầng (trường, bệnh viện, công viên)
5. Export dữ liệu cho báo cáo

**Lợi ích:**
- Visualize kế hoạch quy hoạch
- Tính toán diện tích chính xác
- Quản lý tài liệu số

### Use Case 3: Quản lý Logistics
**Kịch bản:**
Công ty vận chuyển cần tối ưu tuyến đường

**Giải pháp:**
1. Đánh dấu các kho, depot
2. Vẽ tuyến đường giao hàng
3. Đo khoảng cách giữa các điểm
4. Thêm polygon khu vực phục vụ
5. Camera tour để training nhân viên

**Lợi ích:**
- Tối ưu lộ trình
- Tính toán khoảng cách chính xác
- Visualize coverage area

### Use Case 4: Giáo dục Địa lý
**Kịch bản:**
Trường học muốn dạy địa lý Việt Nam tương tác

**Giải pháp:**
1. Đánh dấu các địa danh nổi tiếng
2. Thêm thông tin lịch sử, văn hóa vào popup
3. Camera tour qua các vùng miền
4. Vẽ ranh giới tỉnh thành
5. 3D models cho các công trình nổi tiếng

**Lợi ích:**
- Học sinh hứng thú hơn
- Trực quan, dễ nhớ
- Tương tác thực tế

### Use Case 5: Bất động sản
**Kịch bản:**
Công ty BĐS giới thiệu dự án mới

**Giải pháp:**
1. Đánh dấu vị trí dự án
2. Vẽ ranh giới khu đất
3. 3D models mô phỏng tòa nhà
4. Đánh dấu tiện ích xung quanh
5. Đo khoảng cách đến trung tâm, trường học

**Lợi ích:**
- Presentation chuyên nghiệp
- Khách hàng đánh giá vị trí dễ dàng
- Marketing hiệu quả

---

## 📖 Hướng dẫn sử dụng

### Khởi động ứng dụng
```powershell
npm run dev
```
Truy cập: **http://localhost:8081/**

### Điều khiển cơ bản

#### Camera Controls
- **Zoom**: Scroll chuột
- **Pan** (di chuyển): Click trái + kéo
- **Rotate** (xoay): Click phải + kéo
- **Tilt** (nghiêng): Ctrl + Click trái + kéo
- **Reset**: Click nút 🏠 trên toolbar

#### Top Toolbar
- 📸 **Screenshot**: Chụp và download ảnh
- ⛶ **Fullscreen**: Toàn màn hình
- 🏠 **Reset Camera**: Về vị trí mặc định
- 🔍 **Search**: Tìm địa điểm

### Sử dụng các tính năng

#### 1. Thêm Marker
1. Click "Thêm Marker" trong panel
2. Marker sẽ xuất hiện tại vị trí ngẫu nhiên
3. Camera tự động bay đến marker
4. Click marker để xem thông tin

#### 2. Đo khoảng cách
1. Click "📏 Đo khoảng cách"
2. Click điểm đầu trên bản đồ
3. Click điểm cuối
4. Kết quả hiển thị (m và km)
5. Click "Xóa đo đạc" để xóa

#### 3. Vẽ Polygon
1. Click "⬟ Vẽ Polygon"
2. Click các điểm để tạo polygon
3. Double-click để kết thúc
4. Diện tích tự động tính toán
5. Click polygon để xem thông tin

#### 4. Chạy Camera Tour
1. Click "▶ Bắt đầu Tour"
2. Camera sẽ tự động bay qua 10 địa điểm
3. Mỗi điểm dừng 4 giây
4. Click "⏸ Dừng Tour" để tạm dừng

#### 5. Tìm kiếm
1. Gõ tên địa điểm (vd: "Đà Lạt")
2. Nhấn Enter
3. Camera bay đến địa điểm
4. Thông báo hiển thị kết quả

#### 6. Export dữ liệu
1. Tạo markers, polylines, models
2. Click "💾 Export JSON"
3. File `mars3d-data.json` sẽ được download
4. Lưu file để sử dụng sau

#### 7. Thay đổi Basemap
1. Mở dropdown "Bản đồ nền"
2. Chọn basemap mong muốn:
   - Google Satellite
   - OpenStreetMap
   - ArcGIS Imagery
   - Bing Maps
3. Basemap thay đổi ngay lập tức

---

## 📁 Cấu trúc dự án

```
Mars3D + Vue 3/
├── public/
│   └── vite.svg                    # Icon ứng dụng
├── src/
│   ├── assets/                     # Static assets
│   ├── components/
│   │   └── Mars3DMap.vue          # Component chính - Bản đồ 3D
│   ├── App.vue                     # Root component
│   └── main.js                     # Entry point, bootstrap Vue
├── backups/                        # Backup files
├── node_modules/                   # Dependencies
├── index.html                      # HTML template
├── package.json                    # Dependencies & scripts
├── package-lock.json              # Lock file
├── vite.config.js                 # Vite configuration
├── vue.config.js                  # Vue CLI config (legacy)
└── README.md                       # Documentation (file này)
```

### Component chính: Mars3DMap.vue

**Cấu trúc:**
- **Template**: UI với toolbar, control panel, info panel, stats
- **Script**: Logic xử lý với Composition API
- **Style**: CSS với responsive design

**Các function chính:**
- `addMarker()`: Thêm marker
- `measureDistance()`: Đo khoảng cách
- `drawPolygon()`: Vẽ polygon
- `startCameraAnimation()`: Chạy tour
- `searchLocation()`: Tìm kiếm
- `takeScreenshot()`: Chụp màn hình
- `exportData()`: Export JSON

---

## 🔌 API và Tích hợp

### Mars3D API

#### Khởi tạo Map
```javascript
const map = new mars3d.Map("container-id", {
  scene: {
    center: { lat, lng, alt, heading, pitch },
    globe: { depthTestAgainstTerrain: true }
  },
  basemaps: [...]
});
```

#### Thêm Graphic Layer
```javascript
const layer = new mars3d.layer.GraphicLayer();
map.addLayer(layer);
```

#### Thêm Marker
```javascript
const marker = new mars3d.graphic.BillboardEntity({
  position: [lng, lat, alt],
  style: { image, scale, label }
});
layer.addGraphic(marker);
```

#### Measurement
```javascript
const measure = new mars3d.thing.Measure({});
map.addThing(measure);

measure.distance({ success: (e) => { /* result */ } });
measure.area({ success: (e) => { /* result */ } });
```

#### Camera Control
```javascript
// Fly to point
map.flyToPoint([lng, lat], { radius, duration, pitch });

// Fly to position
map.flyTo({ lat, lng, alt, heading, pitch, duration });

// Get center
const center = map.getCenter();
```

### Tích hợp với Backend

#### Export/Import JSON
```javascript
// Export
const data = { markers: [...], polylines: [...] };
const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
// Download

// Import
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    // Load markers, polylines, etc.
  });
```

#### REST API Integration
```javascript
// Fetch POIs from server
async function loadPOIs() {
  const response = await fetch('/api/pois');
  const pois = await response.json();
  
  pois.forEach(poi => {
    const marker = new mars3d.graphic.BillboardEntity({
      position: [poi.lng, poi.lat, 0],
      style: { label: { text: poi.name } }
    });
    graphicLayer.addGraphic(marker);
  });
}
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. Port đã được sử dụng
```
Port 8081 is in use, trying another one...
```
**Giải pháp:** Vite tự động chuyển sang port khác (8082, 8083...). Check terminal để biết port đang dùng.

#### 2. Module not found
```
Cannot find module 'mars3d'
```
**Giải pháp:**
```powershell
npm install mars3d cesium
```

#### 3. Cesium assets không load
```
Failed to load Workers, Assets
```
**Giải pháp:** Check `vite.config.js` có cấu hình `vite-plugin-static-copy` đúng

#### 4. Bản đồ không hiển thị
**Kiểm tra:**
- Console browser có lỗi không?
- Kết nối internet có ổn định không?
- WebGL có được enable không?

**Test WebGL:**
Truy cập: https://get.webgl.org/

#### 5. Performance chậm
**Giải pháp:**
- Giảm số lượng markers/polygons
- Disable terrain 3D
- Sử dụng simpler basemap (OSM thay vì Google Satellite)
- Update driver card đồ họa

### Debug Tips

#### Enable Console Logging
```javascript
// Trong Mars3DMap.vue
console.log('Map initialized:', map);
console.log('Graphics count:', graphicLayer.value.graphics.length);
```

#### Check Mars3D version
```powershell
npm list mars3d
```

#### Clear cache và rebuild
```powershell
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

## 🤝 Đóng góp

### Quy trình đóng góp

1. **Fork repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```
3. **Commit changes**
   ```bash
   git commit -m "feat: thêm tính năng ABC"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/ten-tinh-nang
   ```
5. **Create Pull Request**

### Coding Standards

#### JavaScript/Vue
- Sử dụng ES6+ syntax
- Vue 3 Composition API
- camelCase cho biến, hàm
- PascalCase cho components
- Comment rõ ràng cho logic phức tạp

#### Commit Messages
Format: `type: description`

Types:
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật docs
- `style`: Format code
- `refactor`: Refactor code
- `test`: Thêm tests
- `chore`: Maintenance

### Báo cáo Bug

**Template:**
```
**Mô tả bug:**
[Mô tả ngắn gọn]

**Các bước tái tạo:**
1. Làm A
2. Làm B
3. Bug xảy ra

**Kết quả mong đợi:**
[Mô tả]

**Kết quả thực tế:**
[Mô tả]

**Screenshots:**
[Nếu có]

**Môi trường:**
- OS: Windows/Mac/Linux
- Browser: Chrome 120
- Node: 18.x
```

---

## 📞 Liên hệ & Hỗ trợ

- **Email**: support@example.com
- **GitHub Issues**: [Link to issues]
- **Documentation**: [Link to full docs]
- **Forum**: [Link to community forum]

---

## 📄 License

Dự án này được phát hành dưới giấy phép MIT License.

Copyright (c) 2025 Mars3D + Vue 3 Team

---

## 🙏 Credits

- **Mars3D**: http://mars3d.cn/
- **Cesium**: https://cesium.com/
- **Vue.js**: https://vuejs.org/
- **Vite**: https://vitejs.dev/

---

**Version**: 1.0.0  
**Last Updated**: November 6, 2025  
**Author**: Mars3D + Vue 3 Development Team



## ⚙️ 1. Khởi tạo dự án Vue
# Nếu chưa có Vue CLI:
npm install -g @vue/cli

# tạo một dự án trong thư mục(chưa có file nào)
npm create vite@latest .
# hay Giải pháp 2 (Nâng cao): "Ép" Vite cài đặt
npm create vite@latest . -- --force
# hay tạo một thư mục con tên frontend
npm create vite@latest frontend

# 📦 2. Cài Mars3D và Cesium
npm install mars3d cesium

# Trong file vue.config.js (tạo nếu chưa có), thêm cấu hình Cesium:

# 🗺️ 3. Tạo component bản đồ 3D
src/components/Mars3DMap.vue

# 🧩 4. Dùng component trong App.vue

# 🚀 5. Chạy thử
npm run serve
# hoặc 
npm run serve -- --port 8081
# hoặc
module.exports = {
  devServer: {
    port: 8081, // hoặc 3000 tùy bạn
  },
};
