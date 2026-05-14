-- ============================================================
-- QuizMaster – Supabase SQL Schema
-- Chạy trong: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Bảng câu hỏi
CREATE TABLE questions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text          text        NOT NULL,
  options       jsonb       NOT NULL,        -- mảng string ["A","B","C","D"]
  correct_index integer     NOT NULL CHECK (correct_index >= 0),
  category      text        NOT NULL DEFAULT 'General',
  difficulty    text        NOT NULL DEFAULT 'medium'
                            CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Bảng kết quả
CREATE TABLE results (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name   text        NOT NULL,
  score         integer     NOT NULL,
  total         integer     NOT NULL,
  percentage    integer     NOT NULL,
  answers       jsonb       NOT NULL DEFAULT '[]',
  time_seconds  integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Seed: 10 câu hỏi mẫu
-- ============================================================
INSERT INTO questions (text, options, correct_index, category, difficulty) VALUES
('Đâu là ngôn ngữ lập trình được tạo ra bởi Guido van Rossum?',
 '["Java","Python","Ruby","Go"]', 1, 'Programming', 'easy'),

('HTTP status code 404 có nghĩa là gì?',
 '["Server Error","Unauthorized","Not Found","Forbidden"]', 2, 'Web', 'easy'),

('Docker image được xây dựng từ file nào?',
 '["docker-compose.yml","Dockerfile","package.json",".dockerignore"]', 1, 'DevOps', 'easy'),

('CI/CD là viết tắt của?',
 '["Code Integration / Code Delivery","Continuous Integration / Continuous Delivery","Container Image / Container Deployment","Custom Integration / Custom Deployment"]',
 1, 'DevOps', 'medium'),

('Lệnh nào dùng để xem log của một container Docker?',
 '["docker ps","docker inspect","docker logs","docker stats"]', 2, 'DevOps', 'medium'),

('Trong Git, lệnh nào tạo một nhánh mới và chuyển sang đó ngay?',
 '["git branch new-branch","git checkout new-branch","git checkout -b new-branch","git switch new-branch --create"]',
 2, 'Git', 'medium'),

('CORS là viết tắt của?',
 '["Cross-Origin Resource Sharing","Cross-Object Runtime Service","Content Object Request System","Client-Origin Response Standard"]',
 0, 'Web', 'medium'),

('Trong Vite, biến môi trường nào mới được bundle vào frontend?',
 '["Tất cả biến trong .env","Biến có tiền tố VITE_","Biến có tiền tố REACT_APP_","Biến có tiền tố PUBLIC_"]',
 1, 'Frontend', 'medium'),

('Layer nào trong mô hình 4-layer bị ảnh hưởng khi CORS error xảy ra?',
 '["L1 – Infrastructure","L2 – External","L3 – Backend","L4 – Frontend"]',
 2, 'DevOps', 'hard'),

('Multi-stage build trong Docker mang lại lợi ích chính nào?',
 '["Tăng tốc độ chạy container","Giảm kích thước image production","Tự động cập nhật dependencies","Bật debug mode mặc định"]',
 1, 'DevOps', 'hard');
