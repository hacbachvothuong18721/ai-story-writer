// AI Story Writer - Main Application Script
class AIStoryWriter {
    constructor() {
        this.apiKey = '';
        this.currentStory = null;
        this.stories = [];
        this.isGenerating = false;
        
        // Initialize application
        this.init();
    }
    
    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderHistory();
        
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
            'sac-hiep': 'sắc hiệp võ thuật, giang hồ nghĩa khí, võ công cao cường',
            'tien-hiep': 'tiên hiệp huyền ảo, tu luyện thành tiên, pháp thuật huyền bí'
        };
        
        const lengthInstructions = {
            'short': 'Viết 2-3 đoạn văn ngắn (200-400 chữ)',
            'medium': 'Viết 3-5 đoạn văn trung bình (400-800 chữ)', 
            'long': 'Viết 5-8 đoạn văn dài (800-1500 chữ)'
        };
        
        return `${systemPrompt}

${lengthInstructions[length]}. 

QUAN TRỌNG - FORMATTING RULES:
- Viết các câu hoàn chỉnh với dấu câu rõ ràng
- Mỗi đoạn văn 2-4 câu
- Sử dụng ngôn ngữ Tiếng Việt tự nhiên
- Tạo không gian trống giữa các đoạn ý
- Miêu tả chi tiết cảnh vật, tâm lý nhân vật

Thể loại: ${genreDescriptions[genre]}

Viết truyện dựa trên ý tưởng: "${userPrompt}"

Định dạng trả về:
TITLE: [Tiêu đề hay và thu hút]
CONTENT: [Nội dung truyện]

Hãy bắt đầu câu chuyện một cách hấp dẫn và tạo ra nội dung chất lượng cao.`;
    }
    
    buildContinuePrompt(currentContent) {
        return `Tiếp tục câu chuyện này một cách tự nhiên và hấp dẫn.

FORMATTING RULES:
- Viết 2-4 đoạn văn tiếp theo
- Mỗi đoạn 2-4 câu hoàn chỉnh  
- Phát triển cốt truyện một cách logic
- Giữ tính nhất quán với nội dung trước
- Sử dụng hoàn toàn tiếng Việt tự nhiên

Nội dung hiện tại:
"${currentContent.slice(-500)}..."

Chỉ trả về nội dung đoạn tiếp theo, không cần tiêu đề:`;
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
    
    // Advanced text formatting with Vietnamese support
    formatVietnameseStory(text) {
        if (!text) return [];
        
        // Clean up text
        text = text.trim()
            .replace(/\s+/g, ' ')           // Multiple spaces -> single space
            .replace(/\n+/g, ' ')           // Multiple newlines -> single space
            .replace(/([.!?])\s*([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬEÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊOÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢUÚÙỦŨỤƯỨỪỬỮỰYÝỲỶỸỴ])/g, '$1\n\n$2'); // Sentence break
        
        // Split into sentences
        const sentences = text.split(/([.!?…]+)\s*/);
        let formattedParagraphs = [];
        let currentParagraph = '';
        let sentenceCount = 0;
        
        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            
            if (sentence && sentence.trim()) {
                currentParagraph += sentence.trim() + punctuation;
                sentenceCount++;
                
                // Create paragraph break conditions
                const shouldBreak = sentenceCount >= 2 && (
                    sentenceCount >= 4 || // Max 4 sentences per paragraph
                    Math.random() > 0.4 || // Random break 60% chance
                    sentence.length > 150 || // Long sentence break
                    /[""]/.test(sentence) // Dialogue break
                );
                
                if (shouldBreak) {
                    formattedParagraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                    sentenceCount = 0;
                } else {
                    currentParagraph += ' ';
                }
            }
        }
        
        // Add remaining content
        if (currentParagraph.trim()) {
            formattedParagraphs.push(currentParagraph.trim());
        }
        
        // Filter empty paragraphs and ensure minimum length
        return formattedParagraphs.filter(p => p.length > 10);
    }
    
    // Format story text into readable paragraphs  
    formatStoryText(text) {
        if (!text) return '';
        
        // Remove excessive whitespace
        text = text.trim().replace(/\s+/g, ' ');
        
        // Split by sentence endings and create paragraphs
        const sentences = text.split(/([.!?]+\s*)/);
        let formattedText = '';
        let currentParagraph = '';
        let sentenceCount = 0;
        
        for (let i = 0; i < sentences.length; i++) {
            const part = sentences[i];
            
            if (part.match(/[.!?]+\s*/)) {
                // This is punctuation + space
                currentParagraph += part;
                sentenceCount++;
                
                // Create new paragraph every 2-3 sentences
                if (sentenceCount >= 2 && Math.random() > 0.3) {
                    formattedText += currentParagraph.trim() + '\n\n';
                    currentParagraph = '';
                    sentenceCount = 0;
                }
            } else if (part.trim()) {
                // This is sentence content
                currentParagraph += part;
            }
        }
        
        // Add remaining content
        if (currentParagraph.trim()) {
            formattedText += currentParagraph.trim();
        }
        
        return formattedText.trim();
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
            
            // FORMAT TEXT INTO PARAGRAPHS
            const formattedParagraphs = this.formatVietnameseStory(parsed.content);
            
            this.currentStory = {
                id: Date.now().toString(),
                title: parsed.title,
                content: formattedParagraphs,
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
            
            // FORMAT CONTINUATION TEXT
            const formattedParagraphs = this.formatVietnameseStory(response.trim());
            
            // Add formatted paragraphs to existing content
            this.currentStory.content.push(...formattedParagraphs);
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
        
        // Display each paragraph with animation delay
        this.currentStory.content.forEach((paragraph, index) => {
            const div = document.createElement('div');
            div.className = 'story-paragraph';
            div.textContent = paragraph;
            
            // Add delay for animation
            setTimeout(() => {
                content.appendChild(div);
                
                // Scroll to new content if this is the last paragraph and there are multiple
                if (index === this.currentStory.content.length - 1 && this.currentStory.content.length > 1) {
                    div.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end' 
                    });
                }
            }, index * 100);
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
    
    // Initialize new authentication and age verification systems
    window.authManager = new AuthManager();
    window.ageVerification = new AgeVerification();
});

// User Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuthUI();
        this.checkStoredAuth();
    }

    initializeAuthUI() {
        // Authentication event listeners
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showRegisterModal());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        
        // Modal controls
        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.hideAuthModals());
        document.getElementById('closeRegisterModal')?.addEventListener('click', () => this.hideAuthModals());
        document.getElementById('switchToRegister')?.addEventListener('click', () => this.switchToRegister());
        document.getElementById('switchToLogin')?.addEventListener('click', () => this.switchToLogin());
        
        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Close modal on overlay click
        document.getElementById('authModalOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModalOverlay') {
                this.hideAuthModals();
            }
        });
    }

    checkStoredAuth() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateAuthUI();
        }
    }

    showLoginModal() {
        document.getElementById('authModalOverlay').classList.remove('hidden');
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('registerModal').classList.add('hidden');
    }

    showRegisterModal() {
        document.getElementById('authModalOverlay').classList.remove('hidden');
        document.getElementById('registerModal').classList.remove('hidden');
        document.getElementById('loginModal').classList.add('hidden');
    }

    hideAuthModals() {
        document.getElementById('authModalOverlay').classList.add('hidden');
        // Reset forms
        document.getElementById('loginForm')?.reset();
        document.getElementById('registerForm')?.reset();
    }

    switchToRegister() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('registerModal').classList.remove('hidden');
    }

    switchToLogin() {
        document.getElementById('registerModal').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('hidden');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Mock authentication - replace with real backend
        if (email && password) {
            this.currentUser = {
                id: Date.now(),
                name: email.split('@')[0],
                email: email,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateAuthUI();
            this.hideAuthModals();
            this.showToast('Đăng nhập thành công!', 'success');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showToast('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }
        
        // Mock registration - replace with real backend
        this.currentUser = {
            id: Date.now(),
            name: name,
            email: email,
            registerTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateAuthUI();
        this.hideAuthModals();
        this.showToast('Đăng ký thành công!', 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.showToast('Đã đăng xuất!', 'info');
    }

    updateAuthUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        
        if (this.currentUser) {
            authButtons.classList.add('hidden');
            userProfile.classList.remove('hidden');
            userName.textContent = this.currentUser.name;
        } else {
            authButtons.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        // Use existing toast system
        if (window.app && window.app.showToast) {
            window.app.showToast(message, type);
        }
    }
}

// Age Verification for Sắc hiệp
class AgeVerification {
    constructor() {
        this.isVerified = localStorage.getItem('ageVerified') === 'true';
        this.initializeAgeVerification();
    }

    initializeAgeVerification() {
        // Listen for genre selection
        document.getElementById('storyGenre')?.addEventListener('change', (e) => {
            if (e.target.value === 'sac-hiep' && !this.isVerified) {
                this.showAgeVerificationModal();
            }
        });

        // Age verification modal controls
        document.getElementById('ageConfirmCheckbox')?.addEventListener('change', (e) => {
            document.getElementById('confirmAgeBtn').disabled = !e.target.checked;
        });

        document.getElementById('confirmAgeBtn')?.addEventListener('click', () => this.confirmAge());
        document.getElementById('cancelAgeBtn')?.addEventListener('click', () => this.cancelAge());
        
        // Close modal on overlay click
        document.getElementById('ageVerificationOverlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'ageVerificationOverlay') {
                this.cancelAge();
            }
        });
    }

    showAgeVerificationModal() {
        document.getElementById('ageVerificationOverlay').classList.remove('hidden');
    }

    hideAgeVerificationModal() {
        document.getElementById('ageVerificationOverlay').classList.add('hidden');
        // Reset form
        document.getElementById('ageConfirmCheckbox').checked = false;
        document.getElementById('confirmAgeBtn').disabled = true;
    }

    confirmAge() {
        this.isVerified = true;
        localStorage.setItem('ageVerified', 'true');
        this.hideAgeVerificationModal();
        if (window.app && window.app.showToast) {
            window.app.showToast('Đã xác nhận độ tuổi. Bạn có thể tạo nội dung sắc hiệp.', 'success');
        }
    }

    cancelAge() {
        document.getElementById('storyGenre').value = '';
        this.hideAgeVerificationModal();
        if (window.app && window.app.showToast) {
            window.app.showToast('Đã hủy chọn thể loại sắc hiệp.', 'info');
        }
    }
}