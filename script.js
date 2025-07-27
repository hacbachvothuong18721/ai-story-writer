// AI Story Writer - Main Application Script
class AIStoryWriter {
    constructor() {
        this.apiKey = '';
        this.currentStory = null;
        this.stories = [];
        this.isGenerating = false;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.ageVerified = false;
        
        // Initialize application
        this.init();
    }
    
    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderHistory();
        this.updateAuthUI();
        
        // Show welcome message if no API key
        if (!this.apiKey) {
            this.showToast('Chào mừng! Vui lòng cài đặt Gemini API Key để bắt đầu.', 'info');
        }
    }
    
    // Storage Management
    loadStoredData() {
        try {
            this.apiKey = localStorage.getItem('ai-story-writer-api-key') || '';
            const storedStories = localStorage.getItem('ai-story-writer-stories');
            this.stories = storedStories ? JSON.parse(storedStories) : [];
            this.ageVerified = localStorage.getItem('ai-story-writer-age-verified') === 'true';
            
            // Load mock user data (in real implementation, this would be from auth service)
            const storedUser = localStorage.getItem('ai-story-writer-user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.isLoggedIn = true;
            }
            
            if (this.apiKey) {
                document.getElementById('apiKey').value = this.apiKey;
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.showToast('Lỗi khi tải dữ liệu đã lưu', 'error');
        }
    }
    
    saveApiKey() {
        try {
            const apiKeyInput = document.getElementById('apiKey');
            const newApiKey = apiKeyInput.value.trim();
            
            if (!newApiKey) {
                this.showToast('Vui lòng nhập API Key', 'warning');
                return;
            }
            
            this.apiKey = newApiKey;
            localStorage.setItem('ai-story-writer-api-key', this.apiKey);
            this.showToast('API Key đã được lưu thành công!', 'success');
            this.closeSettings();
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showToast('Lỗi khi lưu API Key', 'error');
        }
    }
    
    saveStory(story) {
        try {
            const existingIndex = this.stories.findIndex(s => s.id === story.id);
            if (existingIndex !== -1) {
                this.stories[existingIndex] = story;
            } else {
                this.stories.unshift(story);
            }
            
            // Keep only latest 20 stories
            if (this.stories.length > 20) {
                this.stories = this.stories.slice(0, 20);
            }
            
            localStorage.setItem('ai-story-writer-stories', JSON.stringify(this.stories));
            this.renderHistory();
        } catch (error) {
            console.error('Error saving story:', error);
            this.showToast('Lỗi khi lưu truyện', 'error');
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('settingsOverlay').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveApiKey());
        document.getElementById('toggleApiKey').addEventListener('click', () => this.toggleApiKeyVisibility());
        
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.openLoginModal());
        document.getElementById('closeLoginBtn').addEventListener('click', () => this.closeLoginModal());
        document.getElementById('loginModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeLoginModal();
        });
        document.getElementById('showRegisterBtn').addEventListener('click', () => this.switchToRegister());
        document.getElementById('closeRegisterBtn').addEventListener('click', () => this.closeRegisterModal());
        document.getElementById('registerModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeRegisterModal();
        });
        document.getElementById('showLoginBtn').addEventListener('click', () => this.switchToLogin());
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Profile dropdown
        document.getElementById('profileBtn').addEventListener('click', () => this.toggleProfileDropdown());
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                this.closeProfileDropdown();
            }
        });
        
        // Age verification
        document.getElementById('ageConfirmCheck').addEventListener('change', (e) => {
            document.getElementById('confirmAgeBtn').disabled = !e.target.checked;
        });
        document.getElementById('confirmAgeBtn').addEventListener('click', () => this.confirmAge());
        document.getElementById('cancelAgeBtn').addEventListener('click', () => this.cancelAgeVerification());
        document.getElementById('ageVerificationOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.cancelAgeVerification();
        });
        
        // Story generation with age verification check
        document.getElementById('storyGenre').addEventListener('change', (e) => {
            if (e.target.value === 'sac-hiep' && !this.ageVerified) {
                this.showAgeVerification();
                e.target.value = '';
            }
        });
        
        // Story generation
        document.getElementById('storyForm').addEventListener('submit', (e) => this.handleStorySubmit(e));
        document.getElementById('continueBtn').addEventListener('click', () => this.continueStory());
        document.getElementById('newStoryBtn').addEventListener('click', () => this.newStory());
        
        // Export and save
        document.getElementById('exportBtn').addEventListener('click', () => this.exportStory());
        document.getElementById('saveStoryBtn').addEventListener('click', () => this.saveCurrentStory());
        
        // History
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (!this.isGenerating) {
                            if (this.currentStory) {
                                this.continueStory();
                            } else {
                                document.getElementById('storyForm').dispatchEvent(new Event('submit'));
                            }
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.currentStory) {
                            this.exportStory();
                        }
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newStory();
                        break;
                }
            }
        });
    }
    
    // UI Management
    openSettings() {
        document.getElementById('settingsPanel').classList.add('open');
        document.getElementById('settingsOverlay').classList.add('active');
        document.getElementById('apiKey').focus();
    }
    
    closeSettings() {
        document.getElementById('settingsPanel').classList.remove('open');
        document.getElementById('settingsOverlay').classList.remove('active');
    }
    
    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        const icon = toggleBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            apiKeyInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        container.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    showLoading(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    
    setButtonLoading(buttonId, loading = true) {
        const button = document.getElementById(buttonId);
        const spinner = button.querySelector('.loading-spinner');
        const text = button.querySelector('span');
        
        if (loading) {
            button.disabled = true;
            spinner.classList.add('active');
            if (text) text.style.opacity = '0.7';
        } else {
            button.disabled = false;
            spinner.classList.remove('active');
            if (text) text.style.opacity = '1';
        }
    }
    
    // Gemini API Integration
    buildInitialPrompt(genre, userPrompt, length) {
        const systemPrompt = `Bạn là chuyên gia viết tiểu thuyết mạng số 1 Việt Nam, đặc biệt là truyện ngôn tình. Bạn là một 'SIÊU TÁC GIẢ,' một 'NGHỆ NHÂN NGÔN NGỮ' với 30 năm kinh nghiệm. Sứ mệnh của bạn là sáng tác các tiểu thuyết ngôn tình để làm say đắm các bạn trẻ tuổi mộng mơ. Bạn am hiểu sâu sắc văn hóa, thói quen của giới trẻ, những ảo mộng thanh xuân, với vốn từ vựng tiếng Việt phong phú, bạn có khả năng 'SÁNG TÁC' ở trình độ thượng thừa. Mục tiêu tối thượng của bạn là tạo ra những tác phẩm lay động lòng người. Bạn là 'Sáng tác'.

[NHIỆM VỤ DUY NHẤT VÀ TỐI QUAN TRỌNG CỦA BẠN]: Sáng tác tiểu thuyết các thể loại: sắc hiệp, tiên hiệp, ngôn tình.

[ĐẢM BẢO KẾT QUẢ CUỐI CÙNG PHẢI HOÀN TOÀN BẰNG TIẾNG VIỆT, KHÔNG CHẤP NHẬN BẤT KỲ TỪ NGỮ, KÝ TỰ, HAY CẤU TRÚC CÂU NÀO KHÔNG PHẢI TIẾNG VIỆT. Chất lượng sáng tác phải CAO NHẤT, TỰ NHIÊN NHẤT, và 'GÂY NGHIỆN' NHẤT cho độc giả Việt Nam.]`;
        
        const genreDescriptions = {
            'ngon-tinh': 'ngôn tình lãng mạn, tình cảm sâu sắc, câu chuyện tình yêu đẹp',
            'sac-hiep': 'sắc hiệp võ thuật, giang hồ nghĩa khí, võ công cao cường với các cảnh tình dục rõ ràng và gợi cảm phù hợp với nội dung 18+',
            'tien-hiep': 'tiên hiệp huyền ảo, tu luyện thành tiên, pháp thuật huyền bí'
        };
        
        const lengthInstructions = {
            'short': 'Viết đoạn ngắn khoảng 200-400 từ',
            'medium': 'Viết đoạn trung bình khoảng 400-800 từ',
            'long': 'Viết đoạn dài khoảng 800-1500 từ'
        };
        
        let additionalPrompt = '';
        if (genre === 'sac-hiep') {
            additionalPrompt = `
[CẢNH BÁO NỘI DUNG NGƯỜI LỚN - CHỈ DÀNH CHO 18+]

Bạn đang viết truyện sắc hiệp với nội dung tình dục rõ ràng. Hãy:
- Miêu tả chi tiết các cảnh nóng bỏng, quan hệ tình dục một cách nghệ thuật
- Sử dụng ngôn ngữ gợi cảm, khêu gợi nhưng vẫn giữ tính văn học
- Tạo ra những tình huống lôi cuốn, kích thích phù hợp với thể loại 18+
- Đảm bảo nội dung phù hợp với độ tuổi đã xác nhận
- Duy trì chất lượng văn học cao và không phô bày quá mức
`;
        }
        
        return `${systemPrompt}${additionalPrompt}

Hãy viết một câu chuyện ${genreDescriptions[genre]} dựa trên ý tưởng sau: "${userPrompt}"

${lengthInstructions[length]}, với văn phong cuốn hút, hấp dẫn, tạo sự tò mò cho độc giả muốn đọc tiếp.

Định dạng trả về:
TITLE: [Tiêu đề hay và thu hút]
CONTENT: [Nội dung truyện]

Lưu ý: Viết hoàn toàn bằng tiếng Việt, văn phong tự nhiên, hấp dẫn và phù hợp với thể loại đã chọn.`;
    }
    
    buildContinuePrompt(currentContent) {
        return `Dựa trên nội dung truyện hiện tại, hãy tiếp tục viết đoạn tiếp theo với cùng phong cách và nhân vật. Đảm bảo sự liên kết mạch lạc và phát triển cốt truyện hấp dẫn:

${currentContent}

Hãy viết đoạn tiếp theo (400-800 từ) với:
- Duy trì phong cách và tone của truyện
- Phát triển cốt truyện hợp lý
- Tạo tình huống hấp dẫn, kích thích tò mò
- Sử dụng hoàn toàn tiếng Việt tự nhiên

Chỉ trả về nội dung đoạn tiếp theo, không cần tiêu đề.`;
    }
    
    async generateStory(prompt) {
        if (!this.apiKey) {
            throw new Error('Vui lòng cài đặt Gemini API Key trước khi sử dụng');
        }
        
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Không nhận được phản hồi hợp lệ từ AI');
            }
            
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            
            if (error.message.includes('API_KEY_INVALID')) {
                throw new Error('API Key không hợp lệ. Vui lòng kiểm tra lại.');
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                throw new Error('Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.');
            } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
                throw new Error('Quá nhiều yêu cầu. Vui lòng chờ một chút và thử lại.');
            }
            
            throw error;
        }
    }
    
    parseStoryResponse(response) {
        try {
            const lines = response.trim().split('\n');
            let title = '';
            let content = '';
            let isContent = false;
            
            for (const line of lines) {
                if (line.startsWith('TITLE:')) {
                    title = line.replace('TITLE:', '').trim();
                } else if (line.startsWith('CONTENT:')) {
                    content = line.replace('CONTENT:', '').trim();
                    isContent = true;
                } else if (isContent && line.trim()) {
                    content += '\n' + line;
                }
            }
            
            // If no structured format, treat entire response as content
            if (!title && !content) {
                content = response.trim();
                title = this.generateTitleFromContent(content);
            }
            
            return {
                title: title || 'Truyện mới',
                content: content || response.trim()
            };
        } catch (error) {
            console.error('Error parsing story response:', error);
            return {
                title: 'Truyện mới',
                content: response.trim()
            };
        }
    }
    
    generateTitleFromContent(content) {
        const words = content.split(' ').slice(0, 8);
        return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
    }
    
    // Authentication Management
    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const userName = document.getElementById('userName');
        
        if (this.isLoggedIn && this.currentUser) {
            loginBtn.style.display = 'none';
            profileDropdown.style.display = 'block';
            userName.textContent = this.currentUser.name;
        } else {
            loginBtn.style.display = 'flex';
            profileDropdown.style.display = 'none';
        }
    }
    
    openLoginModal() {
        document.getElementById('loginModalOverlay').classList.add('active');
    }
    
    closeLoginModal() {
        document.getElementById('loginModalOverlay').classList.remove('active');
        document.getElementById('loginForm').reset();
    }
    
    openRegisterModal() {
        document.getElementById('registerModalOverlay').classList.add('active');
    }
    
    closeRegisterModal() {
        document.getElementById('registerModalOverlay').classList.remove('active');
        document.getElementById('registerForm').reset();
    }
    
    switchToRegister() {
        this.closeLoginModal();
        this.openRegisterModal();
    }
    
    switchToLogin() {
        this.closeRegisterModal();
        this.openLoginModal();
    }
    
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Mock authentication (in real implementation, this would call backend API)
        if (email && password) {
            this.currentUser = {
                id: Date.now().toString(),
                name: email.split('@')[0],
                email: email
            };
            this.isLoggedIn = true;
            
            localStorage.setItem('ai-story-writer-user', JSON.stringify(this.currentUser));
            this.updateAuthUI();
            this.closeLoginModal();
            this.showToast('Đăng nhập thành công!', 'success');
        } else {
            this.showToast('Vui lòng nhập đầy đủ thông tin', 'warning');
        }
    }
    
    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }
        
        // Mock registration (in real implementation, this would call backend API)
        this.currentUser = {
            id: Date.now().toString(),
            name: name,
            email: email
        };
        this.isLoggedIn = true;
        
        localStorage.setItem('ai-story-writer-user', JSON.stringify(this.currentUser));
        this.updateAuthUI();
        this.closeRegisterModal();
        this.showToast('Tạo tài khoản thành công!', 'success');
    }
    
    handleLogout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.ageVerified = false;
        
        localStorage.removeItem('ai-story-writer-user');
        localStorage.removeItem('ai-story-writer-age-verified');
        
        this.updateAuthUI();
        this.closeProfileDropdown();
        this.showToast('Đã đăng xuất', 'info');
    }
    
    toggleProfileDropdown() {
        const dropdown = document.getElementById('dropdownMenu');
        dropdown.classList.toggle('show');
    }
    
    closeProfileDropdown() {
        const dropdown = document.getElementById('dropdownMenu');
        dropdown.classList.remove('show');
    }
    
    // Age Verification System
    showAgeVerification() {
        document.getElementById('ageVerificationOverlay').classList.add('active');
        document.getElementById('ageConfirmCheck').checked = false;
        document.getElementById('confirmAgeBtn').disabled = true;
    }
    
    confirmAge() {
        this.ageVerified = true;
        localStorage.setItem('ai-story-writer-age-verified', 'true');
        document.getElementById('ageVerificationOverlay').classList.remove('active');
        document.getElementById('storyGenre').value = 'sac-hiep';
        this.showToast('Đã xác nhận độ tuổi. Bạn có thể chọn thể loại Sắc hiệp.', 'success');
    }
    
    cancelAgeVerification() {
        document.getElementById('ageVerificationOverlay').classList.remove('active');
        document.getElementById('storyGenre').value = '';
    }

    // Story Management
    async handleStorySubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating) return;
        
        const genre = document.getElementById('storyGenre').value;
        const length = document.getElementById('storyLength').value;
        const userPrompt = document.getElementById('storyPrompt').value.trim();
        
        if (!genre || !userPrompt) {
            this.showToast('Vui lòng chọn thể loại và nhập ý tưởng truyện', 'warning');
            return;
        }
        
        if (!this.apiKey) {
            this.showToast('Vui lòng cài đặt Gemini API Key trước', 'warning');
            this.openSettings();
            return;
        }
        
        try {
            this.isGenerating = true;
            this.showLoading(true);
            this.setButtonLoading('generateBtn', true);
            
            const prompt = this.buildInitialPrompt(genre, userPrompt, length);
            const response = await this.generateStory(prompt);
            const parsed = this.parseStoryResponse(response);
            
            this.currentStory = {
                id: Date.now().toString(),
                title: parsed.title,
                content: [parsed.content],
                genre: genre,
                length: length,
                originalPrompt: userPrompt,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.displayStory();
            this.saveStory(this.currentStory);
            this.showToast('Truyện đã được tạo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
            this.setButtonLoading('generateBtn', false);
        }
    }
    
    async continueStory() {
        if (!this.currentStory || this.isGenerating) return;
        
        if (!this.apiKey) {
            this.showToast('Vui lòng cài đặt Gemini API Key trước', 'warning');
            this.openSettings();
            return;
        }
        
        try {
            this.isGenerating = true;
            this.setButtonLoading('continueBtn', true);
            
            const currentContent = this.currentStory.content.join('\n\n');
            const prompt = this.buildContinuePrompt(currentContent);
            const response = await this.generateStory(prompt);
            
            this.currentStory.content.push(response.trim());
            this.currentStory.updatedAt = new Date().toISOString();
            
            this.displayStory();
            this.saveStory(this.currentStory);
            this.showToast('Đã tiếp tục câu chuyện!', 'success');
            
        } catch (error) {
            console.error('Error continuing story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.setButtonLoading('continueBtn', false);
        }
    }
    
    displayStory() {
        if (!this.currentStory) return;
        
        const section = document.getElementById('storyDisplaySection');
        const title = document.getElementById('storyTitle');
        const content = document.getElementById('storyContent');
        
        title.textContent = this.currentStory.title;
        content.innerHTML = '';
        
        this.currentStory.content.forEach((paragraph, index) => {
            const div = document.createElement('div');
            div.className = 'story-paragraph';
            div.textContent = paragraph;
            content.appendChild(div);
            
            // Scroll to new paragraph
            if (index === this.currentStory.content.length - 1) {
                setTimeout(() => {
                    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
        
        section.classList.add('visible');
    }
    
    newStory() {
        this.currentStory = null;
        document.getElementById('storyDisplaySection').classList.remove('visible');
        document.getElementById('storyForm').reset();
        document.getElementById('storyPrompt').focus();
        
        // Reset to default selections
        document.getElementById('storyLength').value = 'medium';
    }
    
    saveCurrentStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để lưu', 'warning');
            return;
        }
        
        this.saveStory(this.currentStory);
        this.showToast('Truyện đã được lưu vào lịch sử!', 'success');
    }
    
    exportStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để xuất', 'warning');
            return;
        }
        
        try {
            const content = `${this.currentStory.title}\n\n${this.currentStory.content.join('\n\n')}`;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentStory.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Truyện đã được xuất thành công!', 'success');
        } catch (error) {
            console.error('Error exporting story:', error);
            this.showToast('Lỗi khi xuất truyện', 'error');
        }
    }
    
    // History Management
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.stories.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>Chưa có truyện nào. Hãy tạo truyện đầu tiên của bạn!</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = '';
        
        this.stories.forEach(story => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const preview = story.content[0].substring(0, 100) + '...';
            const createdDate = new Date(story.createdAt).toLocaleDateString('vi-VN');
            const genreLabels = {
                'ngon-tinh': 'Ngôn tình',
                'sac-hiep': 'Sắc hiệp',
                'tien-hiep': 'Tiên hiệp'
            };
            
            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-title">${story.title}</div>
                    <div class="history-item-preview">${preview}</div>
                    <div class="history-item-meta">
                        <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                        <span><i class="fas fa-tag"></i> ${genreLabels[story.genre]}</span>
                        <span><i class="fas fa-file-alt"></i> ${story.content.length} đoạn</span>
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="history-action-btn" title="Xem truyện" onclick="app.loadStory('${story.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="history-action-btn" title="Xuất file" onclick="app.exportStoryById('${story.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="history-action-btn" title="Xóa truyện" onclick="app.deleteStory('${story.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            historyList.appendChild(item);
        });
    }
    
    loadStory(storyId) {
        const story = this.stories.find(s => s.id === storyId);
        if (!story) {
            this.showToast('Không tìm thấy truyện', 'error');
            return;
        }
        
        this.currentStory = { ...story };
        this.displayStory();
        
        // Scroll to story display
        document.getElementById('storyDisplaySection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    exportStoryById(storyId) {
        const story = this.stories.find(s => s.id === storyId);
        if (!story) {
            this.showToast('Không tìm thấy truyện', 'error');
            return;
        }
        
        try {
            const content = `${story.title}\n\n${story.content.join('\n\n')}`;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${story.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Truyện đã được xuất thành công!', 'success');
        } catch (error) {
            console.error('Error exporting story:', error);
            this.showToast('Lỗi khi xuất truyện', 'error');
        }
    }
    
    deleteStory(storyId) {
        if (!confirm('Bạn có chắc chắn muốn xóa truyện này?')) {
            return;
        }
        
        this.stories = this.stories.filter(s => s.id !== storyId);
        localStorage.setItem('ai-story-writer-stories', JSON.stringify(this.stories));
        this.renderHistory();
        
        // If deleted story is currently displayed, hide it
        if (this.currentStory && this.currentStory.id === storyId) {
            this.newStory();
        }
        
        this.showToast('Truyện đã được xóa', 'success');
    }
    
    clearHistory() {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử truyện?')) {
            return;
        }
        
        this.stories = [];
        localStorage.removeItem('ai-story-writer-stories');
        this.renderHistory();
        this.newStory();
        
        this.showToast('Đã xóa toàn bộ lịch sử truyện', 'success');
    }
}

// Initialize Application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIStoryWriter();
});