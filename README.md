# AI Story Writer - Ứng dụng viết truyện tương tác với AI

Một ứng dụng web hiện đại giúp bạn tạo ra những câu chuyện tuyệt vời với sự hỗ trợ của Google Gemini 2.5 Pro AI. Ứng dụng hỗ trợ viết truyện ngôn tình, sắc hiệp, và tiên hiệp với giao diện đẹp mắt và dễ sử dụng.

## ✨ Tính năng chính

### 🎨 Giao diện người dùng
- **Thiết kế hiện đại**: Giao diện gradient tím-xanh với hiệu ứng glassmorphism
- **Responsive**: Tương thích hoàn hảo trên mobile, tablet và desktop
- **Animations mượt mà**: Hiệu ứng chuyển tiếp và animations đẹp mắt
- **Dark theme**: Giao diện tối dịu mắt phù hợp cho việc đọc và viết

### 🤖 Tích hợp AI thông minh
- **Google Gemini 2.5 Pro**: Sử dụng mô hình AI tiên tiến nhất
- **Prompt chuyên biệt**: Được tối ưu đặc biệt cho văn học Việt Nam
- **Văn phong tự nhiên**: AI được huấn luyện tạo văn bản tiếng Việt chất lượng cao
- **Creativity cao**: Temperature 0.9 cho sự sáng tạo tối đa

### 📚 Thể loại truyện đa dạng
- **Ngôn tình**: Câu chuyện tình yêu lãng mạn, cảm động
- **Sắc hiệp**: Võ thuật giang hồ, nghĩa khí anh hùng
- **Tiên hiệp**: Tu luyện huyền ảo, thế giới siêu nhiên

### ⚙️ Tùy chỉnh linh hoạt
- **Độ dài đoạn văn**: Ngắn (200-400 từ), Trung bình (400-800 từ), Dài (800-1500 từ)
- **Tiếp tục câu chuyện**: Phát triển cốt truyện một cách tự nhiên
- **Lưu trữ cục bộ**: Lịch sử truyện được lưu trên máy tính của bạn

### 🔧 Công cụ hỗ trợ
- **Xuất file**: Tải truyện dưới dạng file .txt
- **Lịch sử truyện**: Quản lý và xem lại các truyện đã tạo
- **Phím tắt**: Tương tác nhanh với bàn phím
- **API key an toàn**: Lưu trữ bảo mật trên thiết bị của bạn

## 🚀 Hướng dẫn sử dụng

### 1. Cài đặt Gemini API Key

1. **Truy cập Google AI Studio**:
   - Mở trình duyệt và truy cập: https://makersuite.google.com/app/apikey
   - Đăng nhập bằng tài khoản Google của bạn

2. **Tạo API Key**:
   - Click vào nút "Create API Key"
   - Chọn project hoặc tạo project mới
   - Copy API Key được tạo

3. **Cài đặt trong ứng dụng**:
   - Click vào nút "Cài đặt" ở góc trên bên phải
   - Dán API Key vào ô "Gemini API Key"
   - Click "Lưu API Key"

### 2. Tạo truyện mới

1. **Chọn thể loại**: Ngôn tình, Sắc hiệp, hoặc Tiên hiệp
2. **Chọn độ dài**: Ngắn, Trung bình, hoặc Dài
3. **Nhập ý tưởng**: Mô tả nhân vật, bối cảnh, tình huống bạn muốn
4. **Click "Tạo truyện"**: Chờ AI tạo ra câu chuyện

### 3. Tương tác với truyện

- **Tiếp tục câu chuyện**: Click "Tiếp tục câu chuyện" để phát triển cốt truyện
- **Lưu truyện**: Click biểu tượng bookmark để lưu vào lịch sử
- **Xuất file**: Click biểu tượng download để tải truyện
- **Truyện mới**: Click "Truyện mới" để bắt đầu câu chuyện khác

### 4. Quản lý lịch sử

- **Xem lại truyện**: Click vào truyện trong phần "Lịch sử truyện"
- **Xuất truyện cũ**: Click biểu tượng download trên từng truyện
- **Xóa truyện**: Click biểu tượng thùng rác để xóa

## ⌨️ Phím tắt

| Phím tắt | Chức năng |
|----------|-----------|
| `Ctrl + Enter` | Tạo truyện mới / Tiếp tục câu chuyện |
| `Ctrl + S` | Xuất truyện hiện tại |
| `Ctrl + N` | Bắt đầu truyện mới |

## 🔧 Yêu cầu hệ thống

- **Trình duyệt**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Kết nối Internet**: Cần thiết để gọi Gemini API
- **JavaScript**: Phải được bật
- **LocalStorage**: Để lưu trữ cài đặt và lịch sử

## 🌐 Triển khai trên GitHub Pages

### Cách 1: Fork repository này

1. Click nút "Fork" ở góc trên bên phải
2. Vào Settings của repository đã fork
3. Cuộn xuống phần "Pages"
4. Chọn Source: "Deploy from a branch"
5. Chọn Branch: "main" và folder: "/ (root)"
6. Click "Save"
7. Truy cập `https://yourusername.github.io/ai-story-writer`

### Cách 2: Tải mã nguồn

1. Click "Code" > "Download ZIP"
2. Giải nén và upload lên web hosting của bạn
3. Đảm bảo file `index.html` ở thư mục gốc

## 🔒 Bảo mật và Quyền riêng tư

- **API Key**: Được lưu trữ cục bộ trên thiết bị của bạn, không gửi đến server nào khác
- **Dữ liệu truyện**: Lưu trữ hoàn toàn trên trình duyệt của bạn
- **Không thu thập dữ liệu**: Ứng dụng không gửi thông tin cá nhân đến bên thứ ba
- **HTTPS**: Tất cả giao tiếp với Gemini API được mã hóa

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web semantic
- **CSS3**: Styling với Flexbox, Grid, và CSS Variables
- **Vanilla JavaScript**: Logic ứng dụng thuần, không framework
- **Google Fonts**: Font Inter cho typography đẹp
- **Font Awesome**: Icons chất lượng cao
- **Gemini 2.5 Pro API**: AI model từ Google

## 🎨 Thiết kế UI/UX

- **Color Scheme**: Gradient tím-xanh (#667eea to #764ba2)
- **Typography**: Font Inter với các weight khác nhau
- **Layout**: CSS Grid và Flexbox responsive
- **Effects**: Glassmorphism với backdrop-filter
- **Animations**: Smooth transitions và micro-interactions

## 🐛 Xử lý sự cố

### Không tạo được truyện
- **Kiểm tra API Key**: Đảm bảo API Key đúng và còn hạn sử dụng
- **Kiểm tra kết nối**: Đảm bảo có kết nối Internet ổn định
- **Thử lại**: Đôi khi server AI quá tải, hãy thử lại sau vài phút

### Truyện không hiển thị đúng
- **Làm mới trang**: Nhấn F5 hoặc Ctrl+R
- **Xóa cache**: Xóa cache trình duyệt và thử lại
- **Kiểm tra console**: Mở Developer Tools để xem lỗi

### Lỗi API
- **API_KEY_INVALID**: API Key không đúng, tạo lại API Key mới
- **QUOTA_EXCEEDED**: Đã hết quota, chờ reset hoặc nâng cấp tài khoản
- **RATE_LIMIT_EXCEEDED**: Quá nhiều request, chờ và thử lại

### Vấn đề hiển thị
- **Mobile**: Nếu giao diện không responsive, thử xoay máy hoặc zoom out
- **Font không load**: Kiểm tra kết nối Internet cho Google Fonts

## 📱 Responsive Breakpoints

- **Mobile**: ≤ 768px
- **Tablet**: 769px - 1199px  
- **Desktop**: ≥ 1200px

## 🔄 Cập nhật và Phát triển

### Tính năng đang phát triển
- [ ] Chia sẻ truyện qua mạng xã hội
- [ ] Themes tùy chỉnh
- [ ] Tích hợp Text-to-Speech
- [ ] Export PDF với formatting đẹp
- [ ] Collaborative writing

### Đóng góp
Nếu bạn muốn đóng góp vào dự án:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc có câu hỏi:
- Tạo Issue trên GitHub
- Kiểm tra phần Troubleshooting ở trên
- Đọc kỹ hướng dẫn sử dụng

## 📄 Giấy phép

Dự án này được phát hành dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 🌟 Tính năng nổi bật

- ✅ **Hoàn toàn miễn phí** - Chỉ cần Gemini API Key
- ✅ **Không cần đăng ký** - Sử dụng ngay lập tức
- ✅ **Bảo mật tuyệt đối** - Dữ liệu lưu trữ cục bộ
- ✅ **Giao diện đẹp** - Thiết kế hiện đại, chuyên nghiệp
- ✅ **AI thông minh** - Gemini 2.5 Pro với prompt được tối ưu
- ✅ **Responsive hoàn hảo** - Hoạt động tốt trên mọi thiết bị

---

**Tạo ra những câu chuyện tuyệt vời với AI Story Writer!** 🚀✨