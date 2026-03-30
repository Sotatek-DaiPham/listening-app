# Linguist Dictation Master - Product Requirements Document

## 1. Tầm nhìn & Định vị (Vision)
Linguist Dictation Master là ứng dụng web không gian luyện ngôn ngữ có cấu trúc, giúp người dùng chuyển từ việc nghe thụ động sang luyện nghe chủ động thông qua phương pháp chép chính tả (dictation) dựa trên file Audio và phụ đề SRT. 

Hệ thống giải quyết khó khăn trong việc ôn tập các file audio dài và đáp ứng nhu cầu học trên chính tài nguyên cá nhân của người dùng (podcast, khóa học, phim).

## 2. Các Tính năng Cốt lõi (Core Features)

### 2.1. Cỗ máy Xử lý Đa phương tiện (Media Processing Engine)
- Tiếp nhận file âm thanh (MP3/WAV) và file phụ đề (.srt).
- Tích hợp **FFmpeg** để tự động bóc tách (slice) audio gốc thành các đoạn âm thanh siêu ngắn tương ứng với từng mốc thời gian (timestamp) của file SRT.

### 2.2. Không gian Luyện tập Dictation (Practice Arena)
- Phát từng đoạn audio (segment) riêng biệt.
- Cung cấp ô nhập liệu (text input) để người dùng gõ lại những gì nghe được.
- Engine so khớp văn bản (Text matching): Tự động so sánh input của người dùng với phụ đề gốc. **Bắt buộc:** Phải chuẩn hóa chuỗi (bỏ dấu câu, khoảng trắng thừa, không phân biệt hoa/thường) trước khi so sánh để tránh đánh giá sai.

### 2.3. Quản lý Thư viện (Media Library & Permissions)
Hệ thống phân tách luồng dữ liệu thành 2 nguồn độc lập:
- **Thư viện Hệ thống (Public Library):** Do Admin upload và quản lý (có phân hệ Admin riêng). User chỉ có quyền Read & Practice.
- **Thư viện Cá nhân (Bring-your-own-media):** User tự tải MP3 và SRT lên. File được xử lý và lưu trữ trong không gian riêng (chỉ User đó thấy và học). Yêu cầu Backend + Database để quản lý sở hữu file.

## 3. Tech Stack
- **Frontend & API:** Next.js (App Router) + TailwindCSS.
- **Backend Services:** Next.js API Routes + fluent-ffmpeg.
- **Database:** PostgreSQL (Lưu trữ User, Media Metadata, Progress) + Local/S3 storage cho Audio.
