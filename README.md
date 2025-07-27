# AI Story Writer - Ứng dụng viết truyện tương tác với AI

Một ứng dụng web hiện đại giúp bạn tạo ra những câu chuyện tuyệt vời với sự hỗ trợ của Google Gemini 2.5 Pro AI. Ứng dụng hỗ trợ viết truyện ngôn tình, sắc hiệp, và tiên hiệp với giao diện màu xám hiện đại, hệ thống tài khoản người dùng và kiểm soát nội dung 18+.

## ✨ Tính năng chính

### 🎨 Giao diện người dùng hiện đại
- **Theme màu xám**: Giao diện tối hiện đại với tone màu xám chuyên nghiệp
- **Glassmorphism**: Hiệu ứng kính mờ với backdrop-filter và độ trong suốt
- **Responsive**: Tương thích hoàn hảo trên mobile, tablet và desktop  
- **Animations mượt mà**: Hiệu ứng chuyển tiếp và animations đẹp mắt
- **Accessibility**: Hỗ trợ high contrast mode và keyboard navigation

### 👤 Hệ thống tài khoản người dùng
- **Đăng nhập/Đăng ký**: Modal đăng nhập và tạo tài khoản với validation
- **Hồ sơ cá nhân**: Profile dropdown với menu người dùng
- **Lưu trạng thái**: Session persistence với localStorage
- **Quản lý truyện**: Lịch sử truyện cá nhân cho từng người dùng

### 🔞 Kiểm soát nội dung 18+
- **Xác thực độ tuổi**: Modal cảnh báo khi chọn thể loại Sắc hiệp lần đầu
- **Checkbox xác nhận**: Yêu cầu xác nhận ≥18 tuổi
- **Nội dung nâng cao**: Prompt đặc biệt cho nội dung người lớn
- **Cảnh báo rõ ràng**: Thông báo về nội dung tình dục rõ ràng

### 🤖 Tích hợp AI thông minh
- **Google Gemini 2.5 Pro**: Sử dụng mô hình AI tiên tiến nhất
- **Prompt chuyên biệt**: Được tối ưu đặc biệt cho từng thể loại
- **Văn phong tự nhiên**: AI được huấn luyện tạo văn bản tiếng Việt chất lượng cao
- **Creativity cao**: Temperature 0.9 cho sự sáng tạo tối đa

### 📚 Thể loại truyện đa dạng
- **Ngôn tình**: Câu chuyện tình yêu lãng mạn, cảm động
- **Sắc hiệp**: Võ thuật giang hồ, nghĩa khí anh hùng với nội dung 18+
- **Tiên hiệp**: Tu luyện huyền ảo, thế giới siêu nhiên

### 📝 Định dạng văn bản cải tiến
- **Typography tốt hơn**: Line-height 1.8, letter-spacing 0.3px
- **Text justification**: Căn đều hai bên cho văn bản chuyên nghiệp
- **Paragraph spacing**: Khoảng cách hợp lý giữa các đoạn
- **Dark mode friendly**: Màu sắc tối ưu cho việc đọc trong môi trường tối

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

### 1. Tạo tài khoản (tùy chọn)

1. **Đăng ký tài khoản**:
   - Click nút "Đăng nhập" ở góc trên bên phải
   - Chọn "Tạo tài khoản mới"
   - Nhập tên hiển thị, email và mật khẩu
   - Click "Tạo tài khoản"

2. **Đăng nhập**:
   - Click nút "Đăng nhập"
   - Nhập email và mật khẩu
   - Click "Đăng nhập"

3. **Lợi ích của việc có tài khoản**:
   - Lưu trữ lịch sử truyện cá nhân
   - Đồng bộ dữ liệu trên nhiều thiết bị
   - Quản lý cài đặt cá nhân

### 2. Cài đặt Gemini API Key

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

### 3. Tạo truyện mới

1. **Chọn thể loại**: Ngôn tình, Sắc hiệp, hoặc Tiên hiệp
   - **Lưu ý về Sắc hiệp**: Khi chọn lần đầu, hệ thống sẽ yêu cầu xác nhận độ tuổi ≥18
2. **Chọn độ dài**: Ngắn, Trung bình, hoặc Dài
3. **Nhập ý tưởng**: Mô tả nhân vật, bối cảnh, tình huống bạn muốn
4. **Click "Tạo truyện"**: Chờ AI tạo ra câu chuyện

### 4. Tương tác với truyện

- **Tiếp tục câu chuyện**: Click "Tiếp tục câu chuyện" để phát triển cốt truyện
- **Lưu truyện**: Click biểu tượng bookmark để lưu vào lịch sử
- **Xuất file**: Click biểu tượng download để tải truyện
- **Truyện mới**: Click "Truyện mới" để bắt đầu câu chuyện khác

### 5. Quản lý lịch sử

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
- **Dữ liệu truyện**: Lưu trữ hoàn toàn trên trình duyệt của bạn (localStorage)
- **Thông tin tài khoản**: Chỉ lưu trữ cục bộ, không có backend server thực tế
- **Không thu thập dữ liệu**: Ứng dụng không gửi thông tin cá nhân đến bên thứ ba
- **HTTPS**: Tất cả giao tiếp với Gemini API được mã hóa
- **Kiểm soát nội dung**: Hệ thống xác thực độ tuổi cho nội dung 18+

## 🎨 Thiết kế UI/UX hiện đại

- **Color Scheme**: Tone màu xám chuyên nghiệp với accent emerald green
- **Typography**: Font Inter với line-height và letter-spacing tối ưu
- **Layout**: CSS Grid và Flexbox responsive
- **Effects**: Glassmorphism với backdrop-filter và độ trong suốt
- **Animations**: Smooth transitions và micro-interactions
- **Accessibility**: Hỗ trợ keyboard navigation và high contrast mode

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
- [ ] Backend authentication với Firebase/Supabase
- [ ] API key encryption với user-specific salt
- [ ] Personal story history per user
- [ ] Collaborative writing features
- [ ] Advanced content filtering
- [ ] Export PDF với formatting đẹp
- [ ] Text-to-Speech integration

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web semantic với accessibility
- **CSS3**: Styling với Flexbox, Grid, CSS Variables và Glassmorphism
- **Vanilla JavaScript**: Logic ứng dụng thuần, không framework
- **Google Fonts**: Font Inter cho typography chuyên nghiệp
- **Font Awesome**: Icons chất lượng cao
- **Gemini 2.5 Pro API**: AI model mới nhất từ Google
- **LocalStorage**: Lưu trữ dữ liệu cục bộ an toàn

## 🌟 Tính năng nổi bật mới

- ✅ **Theme màu xám hiện đại** - Giao diện chuyên nghiệp và dễ nhìn
- ✅ **Hệ thống tài khoản** - Đăng nhập/đăng ký với profile dropdown
- ✅ **Kiểm soát nội dung 18+** - Xác thực độ tuổi cho thể loại Sắc hiệp
- ✅ **Typography cải tiến** - Text justification và spacing tối ưu
- ✅ **Glassmorphism effects** - Hiệu ứng kính mờ với backdrop-filter
- ✅ **Enhanced prompts** - Prompt đặc biệt cho nội dung người lớn
- ✅ **Better accessibility** - Keyboard navigation và high contrast
- ✅ **Responsive design** - Tối ưu cho mọi kích thước màn hình

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
- ✅ **Giao diện hiện đại** - Theme màu xám với glassmorphism
- ✅ **Hệ thống tài khoản** - Đăng nhập/đăng ký với profile management
- ✅ **Nội dung 18+** - Kiểm soát và xác thực độ tuổi
- ✅ **Bảo mật tuyệt đối** - Dữ liệu lưu trữ cục bộ
- ✅ **Typography đẹp** - Text justification và spacing tối ưu
- ✅ **AI thông minh** - Gemini 2.5 Pro với prompt chuyên biệt
- ✅ **Responsive hoàn hảo** - Hoạt động tốt trên mọi thiết bị

---

**Tạo ra những câu chuyện tuyệt vời với AI Story Writer!** 🚀✨