# 📖 Hướng dẫn sử dụng tính năng 3D Models

## 🏗️ Tính năng "Thêm 3D Model" là gì?

**Mục đích:**
- Thêm các đối tượng 3D lên bản đồ (tòa nhà, cột, hình khối...)
- Dùng để mô phỏng công trình, quy hoạch đô thị, trực quan hóa dữ liệu
- Hiển thị các đối tượng có chiều cao thực tế trên bản đồ 3D

## 🎯 Ứng dụng thực tế

### 🏢 Quy hoạch đô thị
- Mô phỏng tòa nhà, chung cư trước khi xây dựng
- Trực quan hóa dự án bất động sản
- Đánh giá tác động cảnh quan

### 🏭 Công nghiệp
- Đánh dấu vị trí nhà máy, kho bãi
- Quản lý cơ sở hạ tầng
- Lập kế hoạch logistics

### 🎓 Giáo dục
- Trực quan hóa địa lý 3D
- Dạy về kiến trúc và quy hoạch
- Mô phỏng địa hình

### 📊 Phân tích dữ liệu
- Biểu đồ 3D trên bản đồ
- Trực quan hóa thống kê theo vùng
- So sánh dữ liệu không gian

## 📝 Cách sử dụng

### Bước 1: Chọn loại Model
Trong Control Panel, phần "🏗️ 3D Models", chọn loại model từ dropdown:
- **📦 Hộp 3D** - Phù hợp cho tòa nhà, container
- **🛢️ Trụ tròn** - Phù hợp cho cột, tháp nước, ống khói
- **🔺 Hình nón** - Phù hợp cho mái nhọn, kim tự tháp
- **⚪ Hình cầu** - Phù hợp cho bể chứa, đài quan sát

### Bước 2: Thêm Model
1. Bấm nút **"➕ Thêm Model"**
2. Màn hình sẽ hiển thị thông báo hướng dẫn
3. **Click chuột** trên bản đồ tại vị trí muốn đặt model
4. Model sẽ xuất hiện ngay lập tức

### Bước 3: Xem thông tin
- Click vào model để xem popup với thông tin chi tiết
- Popup hiển thị: Tên, loại, tọa độ

### Bước 4: Quản lý Models
- **👁️ Ẩn/Hiện Models**: Ẩn hoặc hiện tất cả models trên bản đồ
- **🗑️ Xóa tất cả**: Xóa toàn bộ models (và các đối tượng khác)

## 🎨 Các loại Model chi tiết

### 📦 Hộp 3D (Box)
- **Kích thước**: 50m x 50m x 100m (cao)
- **Dùng cho**: Tòa nhà, nhà kho, container
- **Đặc điểm**: Hình chữ nhật, có viền trắng

### 🛢️ Trụ tròn (Cylinder)
- **Kích thước**: Bán kính 30-40m, cao 150m
- **Dùng cho**: Cột điện, tháp nước, ống khói
- **Đặc điểm**: Hình trụ, đáy lớn hơn đỉnh

### 🔺 Hình nón (Cone)
- **Kích thước**: Bán kính đáy 35m, cao 120m
- **Dùng cho**: Mái nhọn, kim tự tháp, núi lửa
- **Đặc điểm**: Nhọn ở đỉnh, rộng ở đáy

### ⚪ Hình cầu (Ellipsoid)
- **Kích thước**: 40m x 40m x 70m
- **Dùng cho**: Bể chứa, đài quan sát, mái vòm
- **Đặc điểm**: Hình bầu dục, mượt mà

## 💡 Tips & Tricks

1. **Chọn góc nhìn phù hợp**: Xoay camera để xem model từ nhiều góc độ
2. **Zoom để xem chi tiết**: Phóng to để thấy rõ hơn
3. **Kết hợp với Terrain**: Bật "Địa hình 3D" để model hiển thị chính xác trên địa hình
4. **Màu ngẫu nhiên**: Mỗi model có màu khác nhau để dễ phân biệt
5. **Export dữ liệu**: Lưu lại vị trí và loại model bằng nút "💾 Export JSON"

## ⚠️ Lưu ý

- Model sẽ được đặt tại vị trí click, độ cao tự động tính theo địa hình
- Mỗi model có label hiển thị tên phía trên
- Có thể thêm nhiều model cùng lúc
- Sử dụng nút "Ẩn Models" khi muốn xem bản đồ gốc

## 🔄 So sánh: Trước và Sau khi sửa

### ❌ Trước (Ngẫu nhiên)
- Bấm nút → Model xuất hiện ở vị trí ngẫu nhiên
- Không kiểm soát được vị trí
- Loại model ngẫu nhiên

### ✅ Sau (Tương tác)
- Chọn loại model trước
- Bấm nút → Click trên bản đồ
- Đặt chính xác vị trí mong muốn
- Kiểm soát hoàn toàn

---

## 📏 Tính năng "Vẽ đường" (Polyline)

### 🎯 Mục đích
- Vẽ đường nối giữa các điểm trên bản đồ
- Đánh dấu tuyến đường, lộ trình, ranh giới
- Tự động tính độ dài đường vẽ

### 📝 Cách sử dụng
1. Bấm nút **"✏️ Vẽ đường mới"**
2. **Click chuột** trên bản đồ để đặt các điểm nối
3. **Click đúp** hoặc nhấn **Enter** để hoàn thành
4. Hệ thống tự động tính và hiển thị độ dài

### 🎯 Ứng dụng
- **Quy hoạch giao thông**: Vẽ tuyến đường, đường cao tốc
- **Hạ tầng**: Đường ống, cáp điện, đường dây
- **Du lịch**: Lộ trình tour, hành trình
- **Logistics**: Tuyến vận chuyển hàng hóa
- **Ranh giới**: Đánh dấu biên giới, khu vực

### 💡 Tips
- Mỗi đường có màu ngẫu nhiên để dễ phân biệt
- Click vào đường để xem popup với độ dài và số điểm
- Sử dụng "👁️ Ẩn/Hiện Đường" để quản lý hiển thị

---

**Chúc bạn sử dụng hiệu quả! 🚀**
