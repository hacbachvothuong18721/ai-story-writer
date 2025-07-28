// AI Story Writer - Clean Implementation
class AIStoryWriter {
    constructor() {
        this.apiKey = '';
        this.currentStory = null;
        this.isGenerating = false;
        
        this.init();
    }
    
    init() {
        this.loadApiKey();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }
    
    // Storage Management
    loadApiKey() {
        try {
            this.apiKey = localStorage.getItem('ai-story-writer-api-key') || '';
            if (this.apiKey) {
                document.getElementById('geminiApiKey').value = this.apiKey;
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }
    
    saveApiKey() {
        try {
            const apiKeyInput = document.getElementById('geminiApiKey');
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
    
    // Event Listeners
    setupEventListeners() {
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveApiKey());
        
        // Story generation
        document.getElementById('storyForm').addEventListener('submit', (e) => this.handleStorySubmit(e));
        document.getElementById('continueStoryBtn').addEventListener('click', () => this.continueStory());
        document.getElementById('newStoryBtn').addEventListener('click', () => this.newStory());
        
        // Story actions
        document.getElementById('copyStoryBtn').addEventListener('click', () => this.copyStory());
        document.getElementById('downloadStoryBtn').addEventListener('click', () => this.downloadStory());
        
        // Modal overlay clicks
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    handleKeyboardShortcuts(e) {
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
                        this.downloadStory();
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    this.newStory();
                    break;
            }
        }
    }
    
    // UI Management
    openSettings() {
        document.getElementById('settingsModal').style.display = 'flex';
        document.getElementById('geminiApiKey').focus();
    }
    
    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }
    
    showWelcomeMessage() {
        if (!this.apiKey) {
            this.showToast('Chào mừng! Vui lòng cài đặt Gemini API Key để bắt đầu tạo truyện.', 'info');
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
    
    // Gemini API Integration
    buildPrompt(genre, userPrompt, length, characterName = '') {
        const systemPrompt = `Bạn là chuyên gia viết tiểu thuyết mạng số 1 Việt Nam với 30 năm kinh nghiệm. Bạn là một 'SIÊU TÁC GIẢ,' một 'NGHỆ NHÂN NGÔN NGỮ' với khả năng sáng tác ở trình độ thượng thừa. Sứ mệnh của bạn là tạo ra những câu chuyện lay động lòng người.
        
[NHIỆM VỤ DUY NHẤT]: Sáng tác truyện chất lượng cao thuộc các thể loại: ngôn tình, sắc hiệp, tiên hiệp, kinh dị, hành động.

[ĐẢM BẢO KẾT QUẢ CUỐI CÙNG PHẢI HOÀN TOÀN BẰNG TIẾNG VIỆT, chất lượng sáng tác phải CAO NHẤT, TỰ NHIÊN NHẤT.]`;
        
        const genreDescriptions = {
            'ngon-tinh': 'ngôn tình lãng mạn, tình cảm sâu sắc, câu chuyện tình yêu đẹp',
            'sac-hiep': 'sắc hiệp võ thuật, tâm lý người lớn, tình cảm nồng cháy',
            'tien-hiep': 'tiên hiệp huyền ảo, tu luyện thành tiên, pháp thuật huyền bí',
            'kinh-di': 'kinh dị supernatural, bầu không khí ma quái, yếu tố siêu nhiên',
            'hanh-dong': 'hành động thriller, phiêu lưu mạo hiểm, nhịp độ nhanh'
        };
        
        const lengthInstructions = {
            'short': 'Viết 2-3 đoạn văn ngắn (200-400 từ)',
            'medium': 'Viết 4-6 đoạn văn trung bình (500-800 từ)', 
            'long': 'Viết 7-10 đoạn văn dài (900-1500 từ)'
        };
        
        let characterInstruction = '';
        if (characterName) {
            characterInstruction = `\nTên nhân vật chính: ${characterName}`;
        }
        
        return `${systemPrompt}

${lengthInstructions[length]}.

QUAN TRỌNG - FORMATTING RULES:
- Viết các câu hoàn chỉnh với dấu câu rõ ràng
- Mỗi đoạn văn 2-4 câu
- Sử dụng ngôn ngữ Tiếng Việt tự nhiên, sinh động
- Tạo không gian trống giữa các đoạn ý
- Miêu tả chi tiết cảnh vật, tâm lý nhân vật
- Xây dựng cốt truyện hấp dẫn, logic

Thể loại: ${genreDescriptions[genre]}${characterInstruction}

Viết truyện dựa trên ý tưởng: "${userPrompt}"

Định dạng trả về:
TITLE: [Tiêu đề hay và thu hút]
CONTENT: [Nội dung truyện]

Hãy bắt đầu câu chuyện một cách hấp dẫn và tạo ra nội dung chất lượng cao.`;
    }
    
    buildContinuePrompt(currentContent, characterName = '') {
        let characterInstruction = '';
        if (characterName) {
            characterInstruction = `\nNhân vật chính: ${characterName}`;
        }
        
        return `Tiếp tục câu chuyện này một cách tự nhiên và hấp dẫn.

FORMATTING RULES:
- Viết 3-5 đoạn văn tiếp theo
- Mỗi đoạn 2-4 câu hoàn chỉnh  
- Phát triển cốt truyện một cách logic
- Giữ tính nhất quán với nội dung trước
- Sử dụng hoàn toàn tiếng Việt tự nhiên${characterInstruction}

Nội dung hiện tại:
"${currentContent.slice(-800)}..."

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
        const words = content.split(' ').slice(0, 6);
        return words.join(' ') + (content.split(' ').length > 6 ? '...' : '');
    }
    
    formatStoryText(text) {
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
    
    // Story Management
    async handleStorySubmit(e) {
        e.preventDefault();
        
        if (this.isGenerating) return;
        
        const genre = document.getElementById('storyGenre').value;
        const length = document.querySelector('input[name="storyLength"]:checked').value;
        const userPrompt = document.getElementById('storyPrompt').value.trim();
        const characterName = document.getElementById('mainCharacter').value.trim();
        
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
            this.setButtonLoading('storyForm', true);
            
            const prompt = this.buildPrompt(genre, userPrompt, length, characterName);
            const response = await this.generateStory(prompt);
            const parsed = this.parseStoryResponse(response);
            
            // Format text into paragraphs
            const formattedParagraphs = this.formatStoryText(parsed.content);
            
            this.currentStory = {
                id: Date.now().toString(),
                title: parsed.title,
                content: formattedParagraphs,
                genre: genre,
                length: length,
                characterName: characterName,
                originalPrompt: userPrompt,
                createdAt: new Date().toISOString()
            };
            
            this.displayStory();
            this.showToast('Truyện đã được tạo thành công!', 'success');
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.setButtonLoading('storyForm', false);
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
            this.setButtonLoading('continueStoryBtn', true);
            
            const currentContent = this.currentStory.content.join('\n\n');
            const prompt = this.buildContinuePrompt(currentContent, this.currentStory.characterName);
            const response = await this.generateStory(prompt);
            
            // Format continuation text
            const formattedParagraphs = this.formatStoryText(response.trim());
            
            // Add formatted paragraphs to existing content
            this.currentStory.content.push(...formattedParagraphs);
            
            this.displayStory();
            this.showToast('Đã tiếp tục câu chuyện!', 'success');
            
        } catch (error) {
            console.error('Error continuing story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.setButtonLoading('continueStoryBtn', false);
        }
    }
    
    displayStory() {
        if (!this.currentStory) return;
        
        const section = document.getElementById('storySection');
        const content = document.getElementById('storyContent');
        
        content.innerHTML = '';
        
        // Display each paragraph with animation delay
        this.currentStory.content.forEach((paragraph, index) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'story-paragraph';
                div.textContent = paragraph;
                content.appendChild(div);
                
                // Scroll to new content if this is the last paragraph
                if (index === this.currentStory.content.length - 1 && this.currentStory.content.length > 1) {
                    div.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end' 
                    });
                }
            }, index * 100);
        });
        
        section.style.display = 'block';
    }
    
    newStory() {
        this.currentStory = null;
        document.getElementById('storySection').style.display = 'none';
        document.getElementById('storyForm').reset();
        document.getElementById('storyPrompt').focus();
        
        // Reset to default selections
        document.querySelector('input[name="storyLength"][value="short"]').checked = true;
    }
    
    copyStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để sao chép', 'warning');
            return;
        }
        
        try {
            const content = `${this.currentStory.title}\n\n${this.currentStory.content.join('\n\n')}`;
            navigator.clipboard.writeText(content).then(() => {
                this.showToast('Đã sao chép truyện vào clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Đã sao chép truyện!', 'success');
            });
        } catch (error) {
            console.error('Error copying story:', error);
            this.showToast('Lỗi khi sao chép truyện', 'error');
        }
    }
    
    downloadStory() {
        if (!this.currentStory) {
            this.showToast('Không có truyện nào để tải xuống', 'warning');
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
            
            this.showToast('Truyện đã được tải xuống thành công!', 'success');
        } catch (error) {
            console.error('Error downloading story:', error);
            this.showToast('Lỗi khi tải xuống truyện', 'error');
        }
    }
    
    setButtonLoading(elementId, loading = true) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (elementId === 'storyForm') {
            const submitBtn = element.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            if (loading) {
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoading.style.display = 'flex';
            } else {
                submitBtn.disabled = false;
                btnText.style.display = 'flex';
                btnLoading.style.display = 'none';
            }
        } else {
            const spinner = element.querySelector('.loading-spinner');
            if (loading) {
                element.disabled = true;
                if (spinner) spinner.style.display = 'block';
            } else {
                element.disabled = false;
                if (spinner) spinner.style.display = 'none';
            }
        }
    }
}

// Initialize Application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIStoryWriter();
});