# Báo Cáo Incident – QuizMaster DevOps

---

## Incident 1 – API trả 500 sau khi cập nhật ENV trên Vercel

### Hiện tượng
- `/api/health` → `{"ok":true}` (bình thường)
- `/api/questions` → HTTP 500 + JSON `{"error":"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided"}`

### Layer lỗi
**L3 – Backend** (config sai, không phải code lỗi)

### Nguyên nhân
Khi cập nhật biến môi trường trên Vercel, `SUPABASE_URL` bị xóa nhầm hoặc nhập sai giá trị.  
Backend dùng lazy init: `getSupabaseAdmin()` chỉ throw error khi được gọi lần đầu → `/api/health` không gọi Supabase nên vẫn OK, nhưng `/api/questions` cần DB nên crash.

### Cách fix
1. Vercel → Backend project → Settings → Environment Variables
2. Kiểm tra `SUPABASE_URL` — phải có dạng `https://xxx.supabase.co`
3. Thêm lại giá trị đúng → **Redeploy**
4. Verify: `curl https://[backend]/api/questions` → JSON array

### Cách phòng tránh
- Luôn test `/api/questions` sau mỗi lần thay đổi ENV, không chỉ `/api/health`
- Lưu tất cả ENV values vào password manager trước khi thay đổi
- `/api/health` chỉ check app alive, không check DB → cần thêm `/api/health/db` nếu muốn monitor đầy đủ

---

## Incident 2 – Frontend trắng trang sau khi deploy

### Hiện tượng
- Mở URL frontend → trang hoàn toàn trắng, không có nội dung
- DevTools → Console: `Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided`

### Layer lỗi
**L4 – Frontend** (biến môi trường VITE_ bị thiếu)

### Nguyên nhân
Vercel frontend project thiếu biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.  
Vite chỉ bundle các biến có tiền tố `VITE_` — biến không có tiền tố này = `undefined` ở browser dù đã khai báo đúng trên Vercel.

### Cách fix
1. DevTools → Console → đọc error message chính xác
2. Vercel → Frontend project → Settings → Environment Variables
3. Thêm: `VITE_SUPABASE_URL` = URL Supabase, `VITE_SUPABASE_ANON_KEY` = anon key
4. **Redeploy** (bắt buộc — biến mới không áp dụng cho deployment cũ)
5. Verify: Mở lại URL, không còn lỗi console đỏ

### Cách phòng tránh
- Luôn đối chiếu `.env.example` với Vercel ENV vars trước khi deploy
- Nhớ: `SUPABASE_URL` ≠ `VITE_SUPABASE_URL` — phải khai báo cả 2, riêng biệt

---

## Incident 3 – Frontend load được nhưng không fetch được câu hỏi

### Hiện tượng
- Trang chủ hiển thị bình thường
- Bấm "Bắt đầu Quiz" → không có câu hỏi, hiện thông báo "Chưa có câu hỏi"
- DevTools → Network: request tới `/api/questions` trả về HTML thay vì JSON
- Console: `SyntaxError: Unexpected token '<'`

### Layer lỗi
**L4 → L3** (Frontend gọi sai URL backend)

### Nguyên nhân
`VITE_API_BASE_URL` bị để trống trên Vercel frontend.  
Khi để trống, `apiFetch('/api/questions')` gọi cùng domain frontend → Vercel frontend không có route `/api/` → trả về `index.html` (HTML) thay vì JSON.

*Lưu ý: Vite proxy `/api → localhost:3001` chỉ hoạt động khi `npm run dev` (local). Production không có proxy.*

### Cách fix
1. DevTools → Network → click request `/api/questions` → xem URL thực tế đang gọi
2. Vercel → Frontend project → Environment Variables
3. Thêm: `VITE_API_BASE_URL` = `https://[backend-url].vercel.app`
4. **Redeploy** frontend
5. Verify: Network tab thấy response JSON array

### Cách phòng tránh
- Deploy theo đúng thứ tự: Backend trước → lấy URL → điền vào `VITE_API_BASE_URL` → deploy Frontend
- Không bao giờ để trống `VITE_API_BASE_URL` trên production
