# 🧠 QuizMaster – DevOps Đồ Án

Hệ thống trắc nghiệm trực tuyến với đầy đủ kiến trúc Frontend + Backend + Database.

---

## 📐 Kiến trúc hệ thống

```
[Trình duyệt]
     │
     ├── HTTPS ──► [Frontend – React/Vite – Vercel Static]
     │                    │
     │               API calls
     │                    │
     └────────────► [Backend – Express/Node.js – Vercel Serverless]
                          │
                    Supabase PostgreSQL
                    (questions, results)
```

### 4 Layer

| Layer | Thành phần | Vai trò |
|-------|-----------|---------|
| L1 – Infra | Vercel | Deploy, routing, env vars |
| L2 – External | Supabase DB | Lưu câu hỏi và kết quả |
| L3 – Backend | Express API | Business logic, API endpoints |
| L4 – Frontend | React + Vite | UI, quiz flow, leaderboard |

---

## 🗂 Cấu trúc project

```
quiz-app/
├── .env                      ← KHÔNG commit (chứa secrets)
├── .env.example              ← Commit được (mẫu trống)
├── .gitignore
├── docker-compose.yml
├── supabase-schema.sql       ← Chạy 1 lần trên Supabase SQL Editor
├── INCIDENTS.md              ← Báo cáo 3 incident thực tế
├── .github/
│   └── workflows/ci.yml     ← GitHub Actions CI
├── backend/
│   ├── Dockerfile
│   ├── vercel.json
│   ├── package.json
│   ├── server.js
│   ├── eslint.config.js
│   ├── vitest.config.js
│   └── src/
│       ├── lib/supabase.js
│       └── controllers/
│           ├── quizController.js
│           └── resultController.js
└── frontend/
    ├── Dockerfile            ← Multi-stage build
    ├── vercel.json
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── types/index.ts
        ├── lib/api.ts
        └── test/setup.ts
```

---

## ⚙️ Cấu hình môi trường

### Bước 1 – Tạo project Supabase
1. https://supabase.com → New project
2. **SQL Editor** → dán nội dung `supabase-schema.sql` → **Run**
3. **Settings → API** → copy 3 giá trị:
   - Project URL → `SUPABASE_URL`
   - anon key → `SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### Bước 2 – Tạo file `.env`
```bash
cp .env.example .env
# Điền các giá trị từ Supabase vào .env
```

### Bước 3 – Chạy local
```bash
# Terminal 1 – Backend
cd backend && npm install && npm run dev

# Terminal 2 – Frontend
cd frontend && npm install && npm run dev
```
Mở http://localhost:5173

---

## 🐳 Docker

### Chạy toàn bộ hệ thống
```bash
# Build và start tất cả services
docker compose up -d

# Xem log
docker compose logs -f

# Xem log từng service
docker compose logs backend
docker compose logs frontend

# Stop
docker compose down
```

Sau khi chạy:
- Frontend: http://localhost:80
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Build image riêng lẻ
```bash
docker build -t quiz-backend ./backend
docker build -t quiz-frontend ./frontend \
  --build-arg VITE_API_BASE_URL=http://localhost:3001
```

---

## 🔄 CI/CD – GitHub Actions

Pipeline tự động chạy khi push vào `main` hoặc `dev`:

```
push/PR → main
    │
    ├── Job: backend
    │     ├── npm ci
    │     ├── npm run lint    (ESLint)
    │     └── npm test        (Vitest)
    │
    └── Job: frontend
          ├── npm ci
          ├── npm run lint
          ├── npm run typecheck
          ├── npm test
          └── npm run build
```

### Thêm GitHub Secrets
Repository → Settings → Secrets → Actions → New repository secret:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon key |
| `VITE_API_BASE_URL` | URL backend (điền sau khi deploy) |

---

## 🚀 Deploy lên Vercel

### Thứ tự bắt buộc
```
[Supabase] setup xong
    ↓
[Backend] deploy → copy URL
    ↓
[Frontend] deploy (dùng URL backend) → copy URL
    ↓
[Backend] cập nhật FRONTEND_URL → Redeploy
```

### Deploy Backend
1. Vercel → **Add New Project** → Import repo → **Root Directory: `backend`**
2. Framework: **Other**
3. Environment Variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_ANON_KEY` | sb_publishable_... |
| `SUPABASE_SERVICE_ROLE_KEY` | sb_secret_... |
| `FRONTEND_URL` | _(để trống lần đầu)_ |

4. Deploy → copy URL backend
5. Verify: `https://[backend-url]/api/health` → `{"ok":true}`

### Deploy Frontend
1. **Add New Project** → cùng repo → **Root Directory: `frontend`**
2. Framework: **Vite**
3. Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | https://xxx.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | sb_publishable_... |
| `VITE_API_BASE_URL` | https://[backend-url].vercel.app |

4. Deploy → copy URL frontend

### Cập nhật CORS Backend
1. Backend project → Settings → Environment Variables
2. `FRONTEND_URL` = URL frontend
3. **Redeploy**

---

## 🔌 API Endpoints

| Method | Path | Input | Output |
|--------|------|-------|--------|
| GET | `/api/health` | – | `{"ok":true}` |
| GET | `/api/questions` | – | JSON array câu hỏi |
| GET | `/api/questions/:id` | – | 1 câu hỏi |
| POST | `/api/questions` | `{text, options[], correct_index, category, difficulty}` | Question object |
| DELETE | `/api/questions/:id` | – | `{"deleted":true}` |
| POST | `/api/results` | `{player_name, score, total, answers[], time_seconds}` | Result object |
| GET | `/api/results` | – | JSON array (top 50) |
| GET | `/api/results/stats` | – | `{total_attempts, avg_percentage, top_score, avg_time_seconds}` |

---

## 🐛 Debug – Layer Thinking

```
Hiện tượng lỗi
    ↓
L4 – Frontend: F12 Console có lỗi đỏ? Biến VITE_ undefined?
    ↓ (nếu không phải)
L3 – Backend: /api/health OK? /api/questions trả 500?
    ↓ (nếu API OK)
L2 – External: Supabase connect được? Bảng tồn tại?
    ↓ (nếu external OK)
L1 – Infra: Vercel build thành công? ENV vars đúng? Redeploy chưa?
```

### Bảng xử lý nhanh

| Hiện tượng | Layer | Fix |
|-----------|-------|-----|
| Trang trắng | L4 | F12 Console → kiểm tra `VITE_*` vars |
| `Unexpected token '<'` | L4→L3 | Thêm `VITE_API_BASE_URL` = URL backend |
| CORS error | L3 | Sửa `FRONTEND_URL` trên backend Vercel |
| `/api/questions` → 500 | L3 | Kiểm tra `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` |
| CI pass, Vercel fail | L1 | Khai báo ENV ở cả GitHub Secrets và Vercel |

---

## 👥 Phân vai nhóm

| Vai trò | Nhiệm vụ |
|---------|---------|
| **Backend Engineer** | `backend/server.js`, controllers, API endpoints |
| **Frontend Engineer** | `frontend/src/App.tsx`, UI components, Vite config |
| **DevOps Engineer** | `.github/workflows/ci.yml`, pipeline CI/CD |
| **Infrastructure Engineer** | Vercel deploy, Supabase setup, Docker compose |
| **QA / SRE Engineer** | `INCIDENTS.md`, tạo và fix incidents, debug |

---

## ✅ Checklist Demo

### System
- [ ] Frontend load được, không lỗi console
- [ ] `GET /api/health` → `{"ok":true}`
- [ ] Làm quiz, xem leaderboard hoạt động
- [ ] Thêm câu hỏi qua Admin panel

### Docker
- [ ] `docker compose up -d` chạy thành công
- [ ] Container `quiz-backend` và `quiz-frontend` đều `Up`
- [ ] `docker compose logs backend` hiện log
- [ ] Truy cập http://localhost hiển thị UI

### CI/CD
- [ ] Push lên GitHub → Actions chạy tự động
- [ ] Cả 2 jobs (backend, frontend) xanh
- [ ] Có lint + test + build trong pipeline

### Deploy
- [ ] Backend URL public: `/api/health` → OK
- [ ] Frontend URL public: UI hiển thị đúng
- [ ] Redeploy được khi thay đổi ENV

### Incident
- [ ] Demo ít nhất 3 incident (xem `INCIDENTS.md`)
- [ ] Giải thích được: hiện tượng → layer → nguyên nhân → fix
