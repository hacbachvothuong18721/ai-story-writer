/**
 * AI Story Writer - Clean JavaScript Architecture
 * Author: Thái Bình Dương
 * Modern story generator with advanced AI integration
 */

class AIStoryWriter {
    constructor() {
        this.apiKey = '';
        this.currentStory = null;
        this.isGenerating = false;
        
        // Story configuration
        this.genres = {
            'ngon-tinh': {
                name: '💕 Ngôn tình - Romance ngọt ngào',
                description: 'Câu chuyện tình yêu lãng mạn, ngọt ngào và cảm động'
            },
            'sac-hiep': {
                name: '🔥 Sắc hiệp - Tâm lý người lớn',
                description: 'Nội dung dành cho người trưởng thành với yếu tố tình cảm mạnh mẽ'
            },
            'tien-hiep': {
                name: '⚔️ Tiên hiệp - Tu tiên võ thuật',
                description: 'Thế giới tu tiên huyền ảo với võ thuật cao cường'
            },
            'kinh-di': {
                name: '👻 Kinh dị - Supernatural horror',
                description: 'Câu chuyện kinh dị đầy kịch tính và bí ẩn'
            },
            'hanh-dong': {
                name: '🎯 Hành động - Action thriller',
                description: 'Hành động gay cấn với nhịp độ nhanh'
            }
        };
        
        this.init();
    }
    
    // Initialize application
    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        
        // Show welcome message if no API key
        if (!this.apiKey) {
            this.showToast('Chào mừng đến với AI Story Writer! Vui lòng cài đặt Gemini API Key để bắt đầu.', 'info');
        }
    }
    
    // Load stored data from localStorage
    loadStoredData() {
        try {
            this.apiKey = localStorage.getItem('ai-story-writer-api-key') || '';
            
            if (this.apiKey) {
                const apiKeyInput = document.getElementById('geminiApiKey');
                if (apiKeyInput) {
                    apiKeyInput.value = this.apiKey;
                }
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
            this.showToast('Lỗi khi tải dữ liệu đã lưu', 'error');
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Settings modal
        this.setupSettingsModal();
        
        // Story form
        const storyForm = document.getElementById('storyForm');
        storyForm?.addEventListener('submit', (e) => this.handleStorySubmit(e));
        
        // Story actions
        const continueBtn = document.getElementById('continueStoryBtn');
        continueBtn?.addEventListener('click', () => this.continueStory());
        
        const newStoryBtn = document.getElementById('newStoryBtn');
        newStoryBtn?.addEventListener('click', () => this.newStory());
        
        const copyBtn = document.getElementById('copyStoryBtn');
        copyBtn?.addEventListener('click', () => this.copyStory());
        
        const downloadBtn = document.getElementById('downloadStoryBtn');
        downloadBtn?.addEventListener('click', () => this.downloadStory());
    }
    
    // Setup settings modal functionality
    setupSettingsModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettingsBtn');
        const cancelBtn = document.getElementById('cancelSettingsBtn');
        const saveBtn = document.getElementById('saveSettingsBtn');
        
        settingsBtn?.addEventListener('click', () => this.openSettings());
        closeBtn?.addEventListener('click', () => this.closeSettings());
        cancelBtn?.addEventListener('click', () => this.closeSettings());
        saveBtn?.addEventListener('click', () => this.saveSettings());
        
        // Close modal when clicking overlay
        settingsModal?.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                this.closeSettings();
            }
        });
    }
    
    // Setup keyboard shortcuts
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
                                const form = document.getElementById('storyForm');
                                form?.dispatchEvent(new Event('submit'));
                            }
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        if (this.currentStory) {
                            this.downloadStory();
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
    
    // Settings management
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            
            const apiKeyInput = document.getElementById('geminiApiKey');
            apiKeyInput?.focus();
        }
    }
    
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    }
    
    saveSettings() {
        try {
            const apiKeyInput = document.getElementById('geminiApiKey');
            const newApiKey = apiKeyInput?.value.trim();
            
            if (!newApiKey) {
                this.showToast('Vui lòng nhập Gemini API Key', 'warning');
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
    
    // Story generation
    async handleStorySubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating) return;
        
        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;
        
        if (!this.apiKey) {
            this.showToast('Vui lòng cài đặt Gemini API Key trước khi tạo truyện', 'warning');
            this.openSettings();
            return;
        }
        
        try {
            this.isGenerating = true;
            this.setLoadingState(true);
            
            const prompt = this.buildStoryPrompt(formData);
            const response = await this.generateStory(prompt);
            const parsedStory = this.parseStoryResponse(response);
            
            this.currentStory = {
                id: Date.now().toString(),
                title: parsedStory.title,
                content: parsedStory.paragraphs,
                genre: formData.genre,
                mainCharacter: formData.mainCharacter,
                originalPrompt: formData.prompt,
                length: formData.length,
                createdAt: new Date().toISOString()
            };
            
            this.displayStory();
            this.showToast('Truyện đã được tạo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.setLoadingState(false);
        }
    }
    
    // Get form data
    getFormData() {
        return {
            genre: document.getElementById('storyGenre')?.value,
            mainCharacter: document.getElementById('mainCharacter')?.value.trim(),
            prompt: document.getElementById('storyPrompt')?.value.trim(),
            length: document.querySelector('input[name="storyLength"]:checked')?.value
        };
    }
    
    // Validate form data
    validateFormData(data) {
        if (!data.genre) {
            this.showToast('Vui lòng chọn thể loại truyện', 'warning');
            return false;
        }
        
        if (!data.prompt) {
            this.showToast('Vui lòng nhập ý tưởng truyện', 'warning');
            return false;
        }
        
        if (!data.length) {
            this.showToast('Vui lòng chọn độ dài truyện', 'warning');
            return false;
        }
        
        return true;
    }
    
    // Build story prompt for AI
    buildStoryPrompt(data) {
        const genre = this.genres[data.genre];
        const lengthInstructions = {
            'short': 'Viết 2-3 đoạn văn ngắn (khoảng 300-500 từ)',
            'medium': 'Viết 4-6 đoạn văn trung bình (khoảng 600-1000 từ)',
            'long': 'Viết 7-10 đoạn văn dài (khoảng 1000-1500 từ)'
        };
        
        const characterInstruction = data.mainCharacter 
            ? `Nhân vật chính tên "${data.mainCharacter}".`
            : 'Tự tạo tên nhân vật chính phù hợp.';
        
        return `Bạn là một tác giả chuyên nghiệp viết truyện ${genre.description}. 

NHIỆM VỤ: Viết một câu chuyện hoàn chỉnh theo yêu cầu sau:

THÔNG TIN:
- Thể loại: ${genre.name}
- ${characterInstruction}
- Ý tưởng: "${data.prompt}"
- Độ dài: ${lengthInstructions[data.length]}

YÊU CẦU VIẾT:
1. Sử dụng hoàn toàn tiếng Việt tự nhiên, chính xác
2. Mỗi đoạn văn 3-5 câu, có ý nghĩa rõ ràng
3. Miêu tả chi tiết cảnh vật, tâm lý nhân vật
4. Tạo cốt truyện hấp dẫn, lôi cuốn
5. Kết thúc đoạn đầu với hook để tiếp tục

ĐỊNH DẠNG TRẢ VỀ:
TITLE: [Tiêu đề hay và thu hút]
CONTENT: [Nội dung truyện được chia thành các đoạn văn rõ ràng]

Hãy viết một câu chuyện xuất sắc!`;
    }
    
    // Generate story using Gemini API
    async generateStory(prompt) {
        if (!this.apiKey) {
            throw new Error('Vui lòng cài đặt Gemini API Key');
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
                            threshold: "BLOCK_ONLY_HIGH"
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
                throw new Error(this.getApiErrorMessage(response.status, errorData));
            }
            
            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Không nhận được phản hồi hợp lệ từ AI');
            }
            
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
    
    // Get API error message
    getApiErrorMessage(status, errorData) {
        if (status === 400) {
            return 'API Key không hợp lệ hoặc yêu cầu không đúng định dạng';
        } else if (status === 429) {
            return 'Quá nhiều yêu cầu. Vui lòng chờ một chút và thử lại';
        } else if (status === 403) {
            return 'Đã vượt quá giới hạn sử dụng API';
        } else {
            return errorData.error?.message || `Lỗi API: ${status}`;
        }
    }
    
    // Parse story response from AI
    parseStoryResponse(response) {
        try {
            const lines = response.trim().split('\n');
            let title = '';
            let content = '';
            let inContent = false;
            
            for (const line of lines) {
                if (line.startsWith('TITLE:')) {
                    title = line.replace('TITLE:', '').trim();
                } else if (line.startsWith('CONTENT:')) {
                    content = line.replace('CONTENT:', '').trim();
                    inContent = true;
                } else if (inContent && line.trim()) {
                    content += '\n' + line;
                }
            }
            
            // If no structured format found, treat entire response as content
            if (!title && !content) {
                content = response.trim();
                title = this.generateTitleFromContent(content);
            }
            
            // Split content into paragraphs
            const paragraphs = this.formatContentIntoParagraphs(content || response);
            
            return {
                title: title || 'Câu chuyện mới',
                paragraphs: paragraphs
            };
        } catch (error) {
            console.error('Error parsing story response:', error);
            return {
                title: 'Câu chuyện mới',
                paragraphs: [response.trim()]
            };
        }
    }
    
    // Generate title from content
    generateTitleFromContent(content) {
        const words = content.split(' ').slice(0, 8);
        return words.join(' ') + (content.split(' ').length > 8 ? '...' : '');
    }
    
    // Format content into paragraphs
    formatContentIntoParagraphs(content) {
        if (!content) return [];
        
        // Clean up content
        content = content.trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ');
        
        // Split by sentence patterns and create paragraphs
        const sentences = content.split(/([.!?…]+\s*)/);
        const paragraphs = [];
        let currentParagraph = '';
        let sentenceCount = 0;
        
        for (let i = 0; i < sentences.length; i += 2) {
            const sentence = sentences[i];
            const punctuation = sentences[i + 1] || '';
            
            if (sentence && sentence.trim()) {
                currentParagraph += sentence.trim() + punctuation;
                sentenceCount++;
                
                // Create paragraph break conditions
                const shouldBreak = sentenceCount >= 3 && (
                    sentenceCount >= 5 || // Max 5 sentences per paragraph
                    Math.random() > 0.4 || // Random break 60% chance
                    sentence.length > 200 // Long sentence break
                );
                
                if (shouldBreak) {
                    if (currentParagraph.trim().length > 20) {
                        paragraphs.push(currentParagraph.trim());
                    }
                    currentParagraph = '';
                    sentenceCount = 0;
                } else {
                    currentParagraph += ' ';
                }
            }
        }
        
        // Add remaining content
        if (currentParagraph.trim().length > 20) {
            paragraphs.push(currentParagraph.trim());
        }
        
        return paragraphs.length > 0 ? paragraphs : [content];
    }
    
    // Continue story
    async continueStory() {
        if (!this.currentStory || this.isGenerating) return;
        
        if (!this.apiKey) {
            this.showToast('Vui lòng cài đặt Gemini API Key', 'warning');
            this.openSettings();
            return;
        }
        
        try {
            this.isGenerating = true;
            this.setLoadingState(true, 'continueStoryBtn');
            
            const continuePrompt = this.buildContinuePrompt();
            const response = await this.generateStory(continuePrompt);
            const newParagraphs = this.formatContentIntoParagraphs(response.trim());
            
            // Add new paragraphs to current story
            this.currentStory.content.push(...newParagraphs);
            this.displayStory();
            
            this.showToast('Đã tiếp tục câu chuyện!', 'success');
            
        } catch (error) {
            console.error('Error continuing story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.setLoadingState(false, 'continueStoryBtn');
        }
    }
    
    // Build continue prompt
    buildContinuePrompt() {
        const currentContent = this.currentStory.content.join('\n\n');
        const genre = this.genres[this.currentStory.genre];
        
        return `Tiếp tục câu chuyện ${genre.description} sau đây một cách tự nhiên và hấp dẫn:

NỘI DUNG HIỆN TẠI:
"${currentContent.slice(-800)}..."

YÊU CẦU:
- Viết 2-4 đoạn văn tiếp theo
- Giữ tính nhất quán với nội dung trước
- Phát triển cốt truyện một cách logic
- Sử dụng hoàn toàn tiếng Việt tự nhiên
- Tạo tình huống hấp dẫn hơn

Chỉ trả về nội dung đoạn tiếp theo, không cần tiêu đề:`;
    }
    
    // Display story
    displayStory() {
        if (!this.currentStory) return;
        
        const storySection = document.getElementById('storySection');
        const storyContent = document.getElementById('storyContent');
        
        if (!storySection || !storyContent) return;
        
        storyContent.innerHTML = '';
        
        // Display each paragraph with animation
        this.currentStory.content.forEach((paragraph, index) => {
            const div = document.createElement('div');
            div.className = 'story-paragraph';
            div.textContent = paragraph;
            
            setTimeout(() => {
                storyContent.appendChild(div);
                
                // Scroll to new content if continuing story
                if (index === this.currentStory.content.length - 1 && this.currentStory.content.length > 1) {
                    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, index * 150);
        });
        
        storySection.style.display = 'block';
    }
    
    // Create new story
    newStory() {
        this.currentStory = null;
        const storySection = document.getElementById('storySection');
        const form = document.getElementById('storyForm');
        
        if (storySection) storySection.style.display = 'none';
        if (form) {
            form.reset();
            // Reset to default radio button
            const defaultRadio = form.querySelector('input[name="storyLength"][value="short"]');
            if (defaultRadio) defaultRadio.checked = true;
        }
        
        const promptField = document.getElementById('storyPrompt');
        if (promptField) promptField.focus();
    }
    
    // Copy story to clipboard
    async copyStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để sao chép', 'warning');
            return;
        }
        
        try {
            const content = `${this.currentStory.title}\n\n${this.currentStory.content.join('\n\n')}`;
            await navigator.clipboard.writeText(content);
            this.showToast('Đã sao chép truyện vào clipboard!', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Lỗi khi sao chép truyện', 'error');
        }
    }
    
    // Download story as file
    downloadStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để tải xuống', 'warning');
            return;
        }
        
        try {
            const content = `${this.currentStory.title}\n\n${this.currentStory.content.join('\n\n')}\n\n---\nTạo bởi: AI Story Writer\nTác giả: Thái Bình Dương`;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentStory.title.replace(/[^a-zA-Z0-9\s]/g, '')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Truyện đã được tải xuống!', 'success');
        } catch (error) {
            console.error('Error downloading story:', error);
            this.showToast('Lỗi khi tải xuống truyện', 'error');
        }
    }
    
    // Set loading state
    setLoadingState(loading, buttonId = 'storyForm') {
        if (buttonId === 'storyForm') {
            const submitBtn = document.querySelector('#storyForm button[type="submit"]');
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoading = submitBtn.querySelector('.btn-loading');
                
                if (loading) {
                    submitBtn.disabled = true;
                    if (btnText) btnText.style.display = 'none';
                    if (btnLoading) btnLoading.style.display = 'flex';
                } else {
                    submitBtn.disabled = false;
                    if (btnText) btnText.style.display = 'flex';
                    if (btnLoading) btnLoading.style.display = 'none';
                }
            }
        } else {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = loading;
                if (loading) {
                    button.style.opacity = '0.7';
                } else {
                    button.style.opacity = '1';
                }
            }
        }
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
        
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
    
    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AIStoryWriter();
});