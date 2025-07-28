// Interactive Story Manager Class
class InteractiveStoryManager {
    constructor() {
        this.currentStory = null;
        this.storySegments = [];
        this.choices = [];
        this.selectedChoices = [];
        this.currentSegmentIndex = 0;
        this.maxChoices = 10;
        this.isInteractiveMode = false;
    }
    
    // Initialize interactive mode
    enableInteractiveMode() {
        this.isInteractiveMode = true;
        this.setupChoiceEventListeners();
    }
    
    // Disable interactive mode (fallback to legacy)
    disableInteractiveMode() {
        this.isInteractiveMode = false;
        this.hideChoices();
        this.showLegacyControls();
    }
    
    // Setup event listeners for choice buttons
    setupChoiceEventListeners() {
        const choiceButtons = document.querySelectorAll('.choice-button');
        choiceButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleChoiceSelection(e));
        });
    }
    
    // Handle choice selection
    handleChoiceSelection(event) {
        const button = event.currentTarget;
        const choice = button.dataset.choice;
        const choiceText = button.querySelector('.choice-text').textContent;
        
        if (button.classList.contains('selected') || button.classList.contains('disabled')) {
            return;
        }
        
        // Mark this choice as selected
        button.classList.add('selected');
        
        // Disable all other choices
        const allButtons = document.querySelectorAll('.choice-button');
        allButtons.forEach(btn => {
            if (btn !== button) {
                btn.classList.add('disabled');
            }
        });
        
        // Store the selected choice
        this.selectedChoices.push({
            segment: this.currentSegmentIndex,
            choice: choice,
            text: choiceText
        });
        
        // Continue story based on choice
        this.continueStoryWithChoice(choice, choiceText);
    }
    
    // Continue story based on selected choice
    async continueStoryWithChoice(selectedChoice, choiceText) {
        if (!window.app || !window.app.apiKey) {
            window.app.showToast('Vui lòng cài đặt Gemini API Key trước', 'warning');
            return;
        }
        
        try {
            window.app.isGenerating = true;
            this.hideChoices();
            this.showLoadingState();
            
            const previousContext = this.storySegments.join(' ');
            const continuePrompt = this.buildContinueChoicePrompt(previousContext, selectedChoice, choiceText);
            
            const response = await window.app.generateStory(continuePrompt);
            const parsed = this.parseChoiceResponse(response);
            
            // Add new segment
            this.storySegments.push(parsed.story);
            this.currentSegmentIndex++;
            
            // Update story display
            this.updateStoryDisplay();
            this.updateProgress();
            
            // Show new choices or end story
            if (this.selectedChoices.length < this.maxChoices && parsed.choices && parsed.choices.length === 4) {
                this.choices.push(parsed.choices);
                this.displayChoices(parsed.choices);
            } else {
                this.endInteractiveStory();
            }
            
            window.app.showToast('Câu chuyện đã tiếp tục dựa trên lựa chọn của bạn!', 'success');
            
        } catch (error) {
            console.error('Error continuing story with choice:', error);
            window.app.showToast(`Lỗi: ${error.message}`, 'error');
        } finally {
            window.app.isGenerating = false;
            this.hideLoadingState();
        }
    }
    
    // Build prompt for continuing story with choice
    buildContinueChoicePrompt(previousContext, selectedChoice, choiceText) {
        return `Tiếp tục câu chuyện dựa trên lựa chọn của người đọc:

Nội dung trước: "${previousContext.slice(-800)}..."

Lựa chọn được chọn: "${selectedChoice}) ${choiceText}"

YÊU CẦU:
- Viết tiếp 200-400 từ dựa trên lựa chọn này
- Phát triển cốt truyện một cách logic và hợp lý
- Kết thúc bằng tình huống mới cần quyết định
- Đề xuất 4 lựa chọn mới cho nhân vật (A, B, C, D)
- Sử dụng hoàn toàn tiếng Việt tự nhiên
- Format liên tục, không chia đoạn văn

Định dạng trả về:
STORY: [nội dung tiếp theo]
CHOICES:
A) [Lựa chọn A]
B) [Lựa chọn B] 
C) [Lựa chọn C]
D) [Lựa chọn D]`;
    }
    
    // Parse response containing story and choices
    parseChoiceResponse(response) {
        try {
            const lines = response.trim().split('\n');
            let story = '';
            let choices = [];
            let currentSection = '';
            
            for (const line of lines) {
                if (line.startsWith('STORY:')) {
                    story = line.replace('STORY:', '').trim();
                    currentSection = 'story';
                } else if (line.startsWith('CHOICES:')) {
                    currentSection = 'choices';
                } else if (line.match(/^[A-D]\)/)) {
                    choices.push(line.trim());
                } else if (currentSection === 'story' && line.trim()) {
                    story += ' ' + line.trim();
                }
            }
            
            // If no structured format found, try to extract from plain text
            if (!story && !choices.length) {
                const parts = response.split(/CHOICES:|Lựa chọn:|A\)|B\)|C\)|D\)/);
                story = parts[0]?.trim() || response.trim();
                
                // Try to extract choices if they exist
                const choiceMatches = response.match(/[A-D]\)[^A-D\)]+/g);
                if (choiceMatches) {
                    choices = choiceMatches.slice(0, 4);
                }
            }
            
            return {
                story: story || response.trim(),
                choices: choices.length === 4 ? choices : []
            };
        } catch (error) {
            console.error('Error parsing choice response:', error);
            return {
                story: response.trim(),
                choices: []
            };
        }
    }
    
    // Display choice buttons
    displayChoices(choices) {
        if (!choices || choices.length !== 4) return;
        
        const choicesContainer = document.getElementById('storyChoices');
        const buttons = choicesContainer.querySelectorAll('.choice-button');
        
        choices.forEach((choice, index) => {
            const button = buttons[index];
            const choiceText = button.querySelector('.choice-text');
            const cleanChoice = choice.replace(/^[A-D]\)\s*/, '');
            choiceText.textContent = cleanChoice;
            
            // Reset button states
            button.classList.remove('selected', 'disabled');
        });
        
        choicesContainer.style.display = 'grid';
        this.hideLegacyControls();
    }
    
    // Hide choice buttons
    hideChoices() {
        document.getElementById('storyChoices').style.display = 'none';
    }
    
    // Show legacy controls
    showLegacyControls() {
        document.getElementById('legacyControls').style.display = 'flex';
    }
    
    // Hide legacy controls
    hideLegacyControls() {
        document.getElementById('legacyControls').style.display = 'none';
    }
    
    // Update story display with continuous format
    updateStoryDisplay() {
        const content = document.getElementById('storyContent');
        const fullStory = this.storySegments.join(' ');
        content.textContent = fullStory;
        
        // Scroll to bottom to show new content
        content.scrollTop = content.scrollHeight;
    }
    
    // Update progress bar and counter
    updateProgress() {
        const progressFill = document.getElementById('storyProgress');
        const choiceCount = document.getElementById('choiceCount');
        const segmentNumber = document.getElementById('segmentNumber');
        
        const progress = (this.selectedChoices.length / this.maxChoices) * 100;
        progressFill.style.width = `${progress}%`;
        choiceCount.textContent = this.selectedChoices.length;
        segmentNumber.textContent = this.currentSegmentIndex + 1;
    }
    
    // End interactive story
    endInteractiveStory() {
        this.hideChoices();
        this.showLegacyControls();
        
        // Update final story object for saving
        if (window.app && window.app.currentStory) {
            window.app.currentStory.content = [this.storySegments.join(' ')];
            window.app.currentStory.choices = this.selectedChoices;
            window.app.currentStory.isInteractive = true;
            window.app.currentStory.updatedAt = new Date().toISOString();
            window.app.saveStory(window.app.currentStory);
        }
        
        window.app.showToast('Câu chuyện tương tác đã hoàn thành!', 'success');
    }
    
    // Initialize first story with choices
    async initializeInteractiveStory(genre, prompt, length) {
        try {
            const initialPrompt = this.buildInitialInteractivePrompt(genre, prompt, length);
            const response = await window.app.generateStory(initialPrompt);
            const parsed = this.parseChoiceResponse(response);
            
            // Initialize story state
            this.storySegments = [parsed.story];
            this.currentSegmentIndex = 0;
            this.selectedChoices = [];
            
            if (parsed.choices && parsed.choices.length === 4) {
                this.choices = [parsed.choices];
                this.updateStoryDisplay();
                this.displayChoices(parsed.choices);
                this.updateProgress();
                this.enableInteractiveMode();
                return true;
            } else {
                // Fallback to legacy mode if no choices generated
                this.disableInteractiveMode();
                return false;
            }
        } catch (error) {
            console.error('Error initializing interactive story:', error);
            this.disableInteractiveMode();
            throw error;
        }
    }
    
    // Build initial prompt for interactive story
    buildInitialInteractivePrompt(genre, userPrompt, length) {
        const systemPrompt = `Bạn là chuyên gia viết tiểu thuyết tương tác số 1 Việt Nam. Nhiệm vụ của bạn là tạo câu chuyện có lựa chọn để người đọc tham gia quyết định.`;
        
        const genreDescriptions = {
            'ngon-tinh': 'ngôn tình lãng mạn, tình cảm sâu sắc',
            'sac-hiep': 'sắc hiệp võ thuật, giang hồ nghĩa khí', 
            'tien-hiep': 'tiên hiệp huyền ảo, tu luyện thành tiên'
        };
        
        const lengthInstructions = {
            'short': '200-400 từ',
            'medium': '400-600 từ',
            'long': '600-800 từ'
        };
        
        return `${systemPrompt}

Tạo phần đầu của câu chuyện ${genreDescriptions[genre]} dựa trên: "${userPrompt}"

YÊU CẦU:
- Độ dài: ${lengthInstructions[length]}
- Format: Văn bản liên tục, không chia đoạn
- Kết thúc bằng tình huống cần quyết định
- Đề xuất 4 lựa chọn hành động rõ ràng (A, B, C, D)
- Sử dụng hoàn toàn tiếng Việt tự nhiên

Định dạng trả về:
STORY: [nội dung câu chuyện]
CHOICES:
A) [Lựa chọn A - mô tả ngắn gọn]
B) [Lựa chọn B - mô tả ngắn gọn]
C) [Lựa chọn C - mô tả ngắn gọn] 
D) [Lựa chọn D - mô tả ngắn gọn]`;
    }
    
    // Show loading state
    showLoadingState() {
        const choicesContainer = document.getElementById('storyChoices');
        choicesContainer.style.opacity = '0.5';
        choicesContainer.style.pointerEvents = 'none';
    }
    
    // Hide loading state
    hideLoadingState() {
        const choicesContainer = document.getElementById('storyChoices');
        choicesContainer.style.opacity = '1';
        choicesContainer.style.pointerEvents = 'auto';
    }
    
    // Reset interactive story
    reset() {
        this.currentStory = null;
        this.storySegments = [];
        this.choices = [];
        this.selectedChoices = [];
        this.currentSegmentIndex = 0;
        this.isInteractiveMode = false;
        this.hideChoices();
        this.showLegacyControls();
        this.updateProgress();
    }
}

// AI Story Writer - Main Application Script
class AIStoryWriter {
    constructor() {
        this.apiKey = '';
        this.currentStory = null;
        this.stories = [];
        this.isGenerating = false;
        
        // Initialize Interactive Story Manager
        this.interactiveManager = new InteractiveStoryManager();
        
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
            'short': 'Viết 2-3 đoạn văn ngắn (200-400 từ)',
            'medium': 'Viết 3-5 đoạn văn trung bình (400-800 từ)', 
            'long': 'Viết 5-8 đoạn văn dài (800-1500 từ)'
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
            
            // Reset interactive manager
            this.interactiveManager.reset();
            
            // Try interactive story first
            const interactiveSuccess = await this.interactiveManager.initializeInteractiveStory(genre, userPrompt, length);
            
            if (interactiveSuccess) {
                // Create story object for interactive mode
                this.currentStory = {
                    id: Date.now().toString(),
                    title: this.generateTitleFromPrompt(userPrompt),
                    content: this.interactiveManager.storySegments,
                    genre: genre,
                    length: length,
                    originalPrompt: userPrompt,
                    isInteractive: true,
                    choices: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                this.displayInteractiveStory();
                this.showToast('Truyện tương tác đã được tạo! Hãy chọn lựa chọn để tiếp tục.', 'success');
            } else {
                // Fallback to legacy mode
                await this.generateLegacyStory(genre, userPrompt, length);
            }
            
        } catch (error) {
            console.error('Error generating story:', error);
            this.showToast(`Lỗi: ${error.message}`, 'error');
            
            // Fallback to legacy mode on error
            try {
                await this.generateLegacyStory(genre, userPrompt, length);
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
            }
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
            this.setButtonLoading('generateBtn', false);
        }
    }
    
    // Generate legacy story (non-interactive)
    async generateLegacyStory(genre, userPrompt, length) {
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
            isInteractive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.displayLegacyStory();
        this.saveStory(this.currentStory);
        this.showToast('Truyện đã được tạo thành công!', 'success');
    }
    
    // Display interactive story
    displayInteractiveStory() {
        if (!this.currentStory) return;
        
        const section = document.getElementById('storyDisplaySection');
        const title = document.getElementById('storyTitle');
        
        title.textContent = this.currentStory.title;
        section.classList.add('visible');
        
        // Story content and choices are handled by InteractiveStoryManager
    }
    
    // Display legacy story (with paragraphs)
    displayLegacyStory() {
        if (!this.currentStory) return;
        
        const section = document.getElementById('storyDisplaySection');
        const title = document.getElementById('storyTitle');
        const content = document.getElementById('storyContent');
        
        title.textContent = this.currentStory.title;
        content.innerHTML = '';
        
        // For legacy stories, format as continuous text
        const fullText = this.currentStory.content.join(' ');
        content.textContent = fullText;
        
        // Reset interactive elements
        this.interactiveManager.hideChoices();
        this.interactiveManager.showLegacyControls();
        
        section.classList.add('visible');
    }
    
    // Generate title from prompt
    generateTitleFromPrompt(prompt) {
        const words = prompt.split(' ').slice(0, 6);
        return words.join(' ') + (prompt.split(' ').length > 6 ? '...' : '');
    }
    
    async continueStory() {
        if (!this.currentStory || this.isGenerating) return;
        
        // If it's an interactive story, let the InteractiveStoryManager handle it
        if (this.currentStory.isInteractive && this.interactiveManager.isInteractiveMode) {
            this.showToast('Vui lòng chọn một lựa chọn để tiếp tục câu chuyện', 'info');
            return;
        }
        
        // Legacy continue story functionality
        if (!this.apiKey) {
            this.showToast('Vui lòng cài đặt Gemini API Key trước', 'warning');
            this.openSettings();
            return;
        }
        
        try {
            this.isGenerating = true;
            this.setButtonLoading('continueBtn', true);
            
            const currentContent = Array.isArray(this.currentStory.content) 
                ? this.currentStory.content.join(' ')
                : this.currentStory.content;
                
            const prompt = this.buildContinuePrompt(currentContent);
            const response = await this.generateStory(prompt);
            
            // FORMAT CONTINUATION TEXT as continuous
            const continuationText = response.trim();
            
            // For legacy stories, append to existing content
            if (Array.isArray(this.currentStory.content)) {
                const fullText = this.currentStory.content.join(' ') + ' ' + continuationText;
                this.currentStory.content = [fullText];
            } else {
                this.currentStory.content += ' ' + continuationText;
            }
            
            this.currentStory.updatedAt = new Date().toISOString();
            
            this.displayLegacyStory();
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
        // Determine if this is an interactive or legacy story
        if (this.currentStory && this.currentStory.isInteractive) {
            this.displayInteractiveStory();
        } else {
            this.displayLegacyStory();
        }
    }
    
    newStory() {
        this.currentStory = null;
        this.interactiveManager.reset();
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
            let content = '';
            
            if (this.currentStory.isInteractive) {
                // Export interactive story with choices
                content = `${this.currentStory.title}\n\n`;
                
                if (this.interactiveManager.storySegments.length > 0) {
                    content += this.interactiveManager.storySegments.join(' ');
                } else {
                    content += Array.isArray(this.currentStory.content) 
                        ? this.currentStory.content.join(' ')
                        : this.currentStory.content;
                }
                
                // Add choices history if available
                if (this.interactiveManager.selectedChoices.length > 0) {
                    content += '\n\n--- Lịch sử lựa chọn ---\n';
                    this.interactiveManager.selectedChoices.forEach((choice, index) => {
                        content += `${index + 1}. ${choice.choice}) ${choice.text}\n`;
                    });
                }
            } else {
                // Export legacy story
                const storyText = Array.isArray(this.currentStory.content) 
                    ? this.currentStory.content.join(' ')
                    : this.currentStory.content;
                content = `${this.currentStory.title}\n\n${storyText}`;
            }
            
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
            
            // Get preview text
            let previewText = '';
            if (story.isInteractive && story.content && story.content.length > 0) {
                previewText = Array.isArray(story.content) 
                    ? story.content[0] 
                    : story.content;
            } else if (story.content && story.content.length > 0) {
                previewText = Array.isArray(story.content) 
                    ? story.content[0] 
                    : story.content;
            }
            
            const preview = previewText.substring(0, 100) + '...';
            const createdDate = new Date(story.createdAt).toLocaleDateString('vi-VN');
            const genreLabels = {
                'ngon-tinh': 'Ngôn tình',
                'sac-hiep': 'Sắc hiệp',
                'tien-hiep': 'Tiên hiệp'
            };
            
            const storyType = story.isInteractive ? ' (Tương tác)' : '';
            const choiceCount = story.choices ? story.choices.length : 0;
            
            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-title">${story.title}${storyType}</div>
                    <div class="history-item-preview">${preview}</div>
                    <div class="history-item-meta">
                        <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                        <span><i class="fas fa-tag"></i> ${genreLabels[story.genre]}</span>
                        ${story.isInteractive ? 
                            `<span><i class="fas fa-gamepad"></i> ${choiceCount} lựa chọn</span>` :
                            `<span><i class="fas fa-file-alt"></i> ${Array.isArray(story.content) ? story.content.length : 1} đoạn</span>`
                        }
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
        
        if (story.isInteractive) {
            // Reset interactive manager and load interactive story
            this.interactiveManager.reset();
            
            // If story has segments, restore them
            if (story.content && Array.isArray(story.content)) {
                this.interactiveManager.storySegments = [...story.content];
            }
            
            if (story.choices) {
                this.interactiveManager.selectedChoices = [...story.choices];
                this.interactiveManager.currentSegmentIndex = story.choices.length;
            }
            
            this.displayInteractiveStory();
            this.interactiveManager.updateStoryDisplay();
            this.interactiveManager.updateProgress();
            
            // If story is complete, show legacy controls
            if (!story.choices || story.choices.length >= this.interactiveManager.maxChoices) {
                this.interactiveManager.disableInteractiveMode();
            }
        } else {
            // Load legacy story
            this.interactiveManager.reset();
            this.displayLegacyStory();
        }
        
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
            let content = '';
            
            if (story.isInteractive) {
                // Export interactive story
                const storyText = Array.isArray(story.content) 
                    ? story.content.join(' ')
                    : story.content;
                content = `${story.title}\n\n${storyText}`;
                
                // Add choices history if available
                if (story.choices && story.choices.length > 0) {
                    content += '\n\n--- Lịch sử lựa chọn ---\n';
                    story.choices.forEach((choice, index) => {
                        content += `${index + 1}. ${choice.choice}) ${choice.text}\n`;
                    });
                }
            } else {
                // Export legacy story
                const storyText = Array.isArray(story.content) 
                    ? story.content.join(' ')
                    : story.content;
                content = `${story.title}\n\n${storyText}`;
            }
            
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

// Initialize Application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIStoryWriter();
    
    // Initialize new authentication and age verification systems
    window.authManager = new AuthManager();
    window.ageVerification = new AgeVerification();
});