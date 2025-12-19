# Style Guide — Checkout (Thanh toán)

Tập tin này là hướng dẫn ngắn bằng tiếng Việt để bạn áp dụng nhanh pattern giao diện cho trang thanh toán và các component liên quan.

---

## 1. Mục tiêu
- Tạo hệ thống CSS nhất quán, dễ tái sử dụng giữa các `section` (card) của trang thanh toán.
- Đảm bảo giao diện rõ ràng, dễ đọc, thân thiện trên mobile và desktop.
- Hỗ trợ accessibility và trạng thái tương tác.

---

## 2. Biến CSS đề xuất (thêm vào `App.css` hoặc đầu `CheckoutPage.css`)
Sao chép khối này lên đầu file CSS global để các component con dùng chung.

:root {
  --bg: #f5f7fa;           /* nền trang */
  --card-bg: #ffffff;      /* nền cho card/section */
  --muted: #666666;        /* chữ phụ */
  --accent: #4CAF50;       /* màu chính (CTA) */
  --accent-dark: #388E3C;  /* màu đậm hơn cho gradient */
  --danger: #E53935;       /* lỗi / giá nổi bật */
  --shadow: 0 6px 20px rgba(0,0,0,0.06);
  --radius: 12px;
  --gap: 16px;
  --gap-sm: 8px;
  --transition: 180ms ease;
}

/* Container chung */
.checkout-container {
  background: var(--bg);
  color: #222;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  padding: 20px;
  max-width: 980px;
  margin: 0 auto;
}

---

## 3. Quy tắc chung cho mọi card (section)
Sử dụng lớp `.section` cho mọi block (Address, Product, Shipping, Payment, Voucher, Summary).

.section {
  background: var(--card-bg);
  padding: var(--gap);
  border-radius: var(--radius);
  margin-bottom: 14px;
  box-shadow: var(--shadow);
  transition: box-shadow var(--transition), transform var(--transition);
}
.section:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.section h3 {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

/* utilities */
.row { display:flex; gap:var(--gap); align-items:center; }
.muted { color: var(--muted); font-size: 13px; }
.small { font-size: 13px; color: var(--muted); }

/* focus cho input */
input:focus, textarea:focus, .voucher-input:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(76,175,80,0.08);
  border-color: var(--accent);
}

/* subtle separator */
.section + .section { border-top: 1px solid rgba(0,0,0,0.03); }

---

## 4. Mẫu CSS cho từng component (copy vào file CSS tương ứng)

### 4.1 OrderItem (sửa nhẹ từ `OrderItem.css`)
.order-item-section {
  background: var(--card-bg);
  padding: var(--gap);
  border-radius: var(--radius);
  margin-bottom: var(--gap);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.order-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}
.order-item-media {
  width: 80px; height: 80px; border-radius: 8px; overflow: hidden; background: #e9ecef;
}
.order-item-image { width:100%; height:100%; object-fit:cover; }
.order-item-info { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
.order-item-name { font-size:15px; font-weight:600; color:#222; margin:0 0 8px 0; /* clamp dòng */ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.order-item-price { color: var(--danger); font-weight:600; }
.order-item-total { color: var(--accent); font-weight:700; }

/* responsive */
@media (max-width: 768px) {
  .order-item { padding: 10px; flex-direction: row; }
  .order-item-media { width: 70px; height: 70px; }
  .order-item-name { font-size: 14px; }
}

---

### 4.2 UserAddressSection
.address-display { display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8f9fa; border-radius:8px; cursor:pointer; }
.address-display:hover { background:#f1f8f4; }
.default-badge { background: var(--accent); color: white; padding:2px 8px; border-radius:6px; font-size:12px; }

---

### 4.3 VoucherSection
.voucher-input-wrapper { display:flex; gap:8px; }
.voucher-input { flex:1; padding:10px; border:1px solid #ddd; border-radius:8px; }
.apply-voucher-btn { padding:10px 18px; background:var(--accent); color:white; border-radius:8px; }
.voucher-error { color: var(--danger); background:#FFEBEE; padding:8px; border-radius:6px; margin-top:8px; }

---

### 4.4 ShippingMethod & PaymentMethod (pattern)
.option { display:flex; align-items:center; gap:12px; padding:12px; background:#f8f9fa; border-radius:8px; border:1px solid #eee; cursor:pointer; transition:background var(--transition); }
.option:hover { background:#f1f8f4; border-color:var(--accent); }
.option input[type="radio"] { width:18px; height:18px; accent-color: var(--accent); }

---

### 4.5 OrderSummary
.summary-row { display:flex; justify-content:space-between; padding:8px 0; color:var(--muted); }
.summary-row.total-row { border-top:1px solid #eee; padding-top:12px; font-weight:700; color:#222; }
.total-amount { color: var(--danger); font-size:18px; font-weight:700; }

---

### 4.6 PlaceOrder Button (CTA)
.place-order-wrapper { position: sticky; bottom: 0; background: transparent; padding-top: 8px; }
.place-order-btn { width:100%; padding:14px; background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%); color:white; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; box-shadow: 0 8px 24px rgba(76,175,80,0.18); transition: transform var(--transition), box-shadow var(--transition); }
.place-order-btn:hover { transform: translateY(-3px); }
.place-order-btn:disabled { opacity:0.6; cursor:not-allowed; box-shadow:none; }

---

## 5. Accessibility checklist (ngắn gọn)
- [ ] Màu chữ đảm bảo contrast >= 4.5:1 với nền.
- [ ] Các input/radio có `:focus-visible` rõ (outline/box-shadow).
- [ ] Kích thước target đủ lớn trên mobile (>= 44x44 px cho nút). 
- [ ] Sử dụng `aria-*` nếu cần cho dynamic content (modal, error messages).

---

## 6. Cách áp dụng nhanh (step-by-step)
1. Dán block `:root` (biến) vào `frontend/src/App.css` (hoặc `CheckoutPage.css`) ở đầu file.
2. Trong từng file CSS component (ví dụ `OrderItem.css`, `VoucherSection.css`, `PaymentMethodSection.css`), thay các giá trị tĩnh (màu, padding, radius) bằng biến `var(--xxx)` tương ứng.
3. Đảm bảo import CSS trong component: `import "./OrderItem.css";`.
4. Test trên mobile (sim 360/375) và desktop, kiểm tra focus bằng bàn phím.

---

## 7. Checklist khi hoàn tất
- [ ] Tất cả section dùng `.section` hoặc kế thừa style chung.
- [ ] Nút CTA hiển thị đúng và responsive.
- [ ] Các states hover/focus/disabled hoạt động.
- [ ] Kiểm tra contrast cho các văn bản quan trọng và CTA.

---

## Chú ý: Ưu tiên các màu đen, trắng, đỏ trước mới tới các màu khác