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
- **Điều chỉnh âm lượng (Audio Controls)**: Tích hợp thanh trượt âm lượng với khả năng ghi nhớ thiết lập người dùng (`localStorage`) và hỗ trợ phím tắt (Mũi tên Lên/Xuống).
- Cung cấp ô nhập liệu (text input) để người dùng gõ lại những gì nghe được.
- Engine so khớp văn bản (Text matching): Tự động so sánh input của người dùng với phụ đề gốc. **Bắt buộc:** Phải chuẩn hóa chuỗi (bỏ dấu câu, khoảng trắng thừa, không phân biệt hoa/thường) trước khi so sánh để tránh đánh giá sai.

### 2.3. Quản lý Thư viện (Media Library & Permissions)
Hệ thống phân tách luồng dữ liệu thành 2 nguồn độc lập:
- **Thư viện Hệ thống (Public Library):** Do Admin upload và quản lý (có phân hệ Admin riêng). User chỉ có quyền Read & Practice.
- **Thư viện Cá nhân (Bring-your-own-media):** User tự tải MP3 và SRT lên. File được xử lý và lưu trữ trong không gian riêng (chỉ User đó thấy và học). Yêu cầu Backend + Database để quản lý sở hữu file.

### 2.4. Hỗ trợ học tập AI (AI Learning Assistant)
- **Dịch thuật & Phân tích ngữ pháp**: Sử dụng Gemini AI để cung cấp bản dịch và giải thích ngữ pháp chuyên sâu cho từng câu sau khi người dùng hoàn thành chính xác.
- **Tối ưu hóa học tập**: Giải thích ngắn gọn, súc tích bằng tiếng Việt, tập trung vào các điểm ngữ pháp khó và từ vựng mới.

### 2.5. Đánh dấu & Lưu trữ Câu chọn lọc (Sentence Bookmarking)
- Cho phép người dùng đánh dấu (**Bookmark**) những câu khó hoặc yêu thích để luyện tập lại sau.
- **Danh sách Yêu thích (Favorites Sidebar)**: Cung cấp thanh bên để xem danh mục các câu đã lưu trong bài học, giúp truy cập nhanh và ôn tập chuyên sâu mà không lộ trước nội dung lời thoại (Script).

## 3. Tech Stack
- **Frontend & API:** Next.js (App Router) + TailwindCSS.
- **AI Service:** Google Generative AI (Gemini).
- **Backend Services:** Next.js API Routes + fluent-ffmpeg.
- **Database:** PostgreSQL (Lưu trữ User, Media Metadata, Progress, AI Cache) + Local/S3 storage cho Audio.
