// Writer Interface JavaScript

class ArticleWriter {
    constructor() {
        this.quill = null;
        this.currentArticle = {
            id: null,
            title: '',
            content: '',
            category: '',
            tags: [],
            excerpt: '',
            status: 'draft',
            publishDate: null,
            createdAt: null,
            updatedAt: null
        };
        this.autoSaveInterval = null;
        this.isModified = false;
        
        this.init();
    }

    init() {
        this.setupQuillEditor();
        this.setupEventListeners();
        this.setupAutoSave();
        this.initializeDateField();
        this.loadDraft();
        this.updateWordCount();
    }

    // Initialize Quill Rich Text Editor
    setupQuillEditor() {
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ];

        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Tell your story...'
        });

        // Listen for content changes
        this.quill.on('text-change', () => {
            this.isModified = true;
            this.updateWordCount();
            this.updateSaveStatus('Modified');
        });

        // Handle image uploads
        this.quill.getModule('toolbar').addHandler('image', () => {
            this.selectLocalImage();
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Title input
        document.getElementById('articleTitle').addEventListener('input', (e) => {
            this.currentArticle.title = e.target.value;
            this.isModified = true;
            this.updateSaveStatus('Modified');
        });

        // Category select
        document.getElementById('articleCategory').addEventListener('change', (e) => {
            this.currentArticle.category = e.target.value;
            this.isModified = true;
        });

        // Tags input
        document.getElementById('articleTags').addEventListener('input', (e) => {
            this.currentArticle.tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            this.isModified = true;
        });

        // Excerpt input
        document.getElementById('articleExcerpt').addEventListener('input', (e) => {
            this.currentArticle.excerpt = e.target.value;
            this.isModified = true;
        });

        // Date input
        document.getElementById('articleDate').addEventListener('change', (e) => {
            this.currentArticle.customDate = e.target.value;
            this.isModified = true;
        });

        // Image upload area
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleImageFiles(files);
        });

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageFiles(files);
        });

        // Publish schedule checkbox
        document.getElementById('schedulePublish').addEventListener('change', (e) => {
            const publishDate = document.getElementById('publishDate');
            publishDate.style.display = e.target.checked ? 'block' : 'none';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveDraft();
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.publishArticle();
                }
            }
        });

        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
                this.closePublish();
            }
        });
    }

    // Initialize date field with today's date
    initializeDateField() {
        const dateInput = document.getElementById('articleDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        this.currentArticle.customDate = today;
    }

    // Setup auto-save functionality
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.isModified) {
                this.saveDraft(true); // Silent save
            }
        }, 30000); // Auto-save every 30 seconds
    }

    // Update word count
    updateWordCount() {
        const text = this.quill.getText();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        document.getElementById('wordCount').textContent = `${words} words`;
    }

    // Update save status
    updateSaveStatus(status) {
        document.getElementById('saveStatus').textContent = status;
    }

    // Handle image file uploads
    handleImageFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                this.insertImage(file);
            }
        });
    }

    // Insert image into editor
    insertImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const range = this.quill.getSelection();
            this.quill.insertEmbed(range.index, 'image', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Select local image for upload
    selectLocalImage() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
            const file = input.files[0];
            if (file) {
                this.insertImage(file);
            }
        };
    }

    // Save article as draft
    saveDraft(silent = false) {
        this.currentArticle.content = this.quill.root.innerHTML;
        this.currentArticle.customDate = document.getElementById('articleDate').value;
        this.currentArticle.updatedAt = new Date().toISOString();
        
        if (!this.currentArticle.id) {
            this.currentArticle.id = this.generateId();
            this.currentArticle.createdAt = new Date().toISOString();
        }

        // Save to localStorage (in a real app, this would be an API call)
        localStorage.setItem(`article_${this.currentArticle.id}`, JSON.stringify(this.currentArticle));
        
        this.isModified = false;
        
        if (!silent) {
            this.updateSaveStatus('Saved');
            this.showToast('Draft saved successfully!');
        } else {
            this.updateSaveStatus('Auto-saved');
        }

        // Clear auto-save indicator after a moment
        setTimeout(() => {
            if (!this.isModified) {
                this.updateSaveStatus('Ready to write');
            }
        }, 2000);
    }

    // Load existing draft
    loadDraft() {
        // Check if editing an existing article via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            // Load specific article for editing
            const article = this.getArticleById(editId);
            if (article) {
                this.loadArticle(article);
                this.updateSaveStatus('Editing published article');
                return;
            }
        }
        
        // Otherwise load the most recent draft
        const savedArticles = this.getSavedArticles();
        const drafts = savedArticles.filter(article => article.status === 'draft');
        if (drafts.length > 0) {
            this.loadArticle(drafts[0]);
        }
    }
    
    // Get specific article by ID
    getArticleById(id) {
        try {
            const article = localStorage.getItem(`article_${id}`);
            return article ? JSON.parse(article) : null;
        } catch (e) {
            console.error('Error loading article:', e);
            return null;
        }
    }

    // Load specific article
    loadArticle(article) {
        this.currentArticle = { ...article };
        
        document.getElementById('articleTitle').value = article.title || '';
        document.getElementById('articleCategory').value = article.category || '';
        document.getElementById('articleTags').value = article.tags ? article.tags.join(', ') : '';
        document.getElementById('articleExcerpt').value = article.excerpt || '';
        
        // Set the date field
        if (article.publishDate) {
            const date = new Date(article.publishDate);
            const dateString = date.toISOString().split('T')[0];
            document.getElementById('articleDate').value = dateString;
            this.currentArticle.customDate = dateString;
        } else if (article.customDate) {
            document.getElementById('articleDate').value = article.customDate;
            this.currentArticle.customDate = article.customDate;
        }
        
        if (article.content) {
            // If content is HTML string, set it directly
            if (typeof article.content === 'string') {
                this.quill.root.innerHTML = article.content;
            } else {
                // If content is Quill Delta format, use setContents
                this.quill.setContents(article.content);
            }
        }
        
        this.isModified = false;
        this.updateSaveStatus('Loaded');
        this.updateWordCount();
    }

    // Get all saved articles
    getSavedArticles() {
        const articles = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('article_')) {
                try {
                    const article = JSON.parse(localStorage.getItem(key));
                    articles.push(article);
                } catch (e) {
                    console.error('Error parsing saved article:', e);
                }
            }
        }
        return articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    // Preview article
    previewArticle() {
        const previewModal = document.getElementById('previewModal');
        const previewArticle = document.getElementById('previewArticle');
        
        const title = document.getElementById('articleTitle').value || 'Untitled Article';
        const category = document.getElementById('articleCategory').value;
        const tags = document.getElementById('articleTags').value;
        const excerpt = document.getElementById('articleExcerpt').value;
        const content = this.quill.root.innerHTML;
        
        // Use selected date or current date
        const selectedDate = document.getElementById('articleDate').value;
        const displayDate = selectedDate ? 
            new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) :
            new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        previewArticle.innerHTML = `
            <h1>${title}</h1>
            <div class="article-meta">
                <span>Published on ${displayDate}</span>
                ${category ? `<span> • ${category}</span>` : ''}
                ${tags ? `<span> • Tags: ${tags}</span>` : ''}

                ${excerpt ? `<div class="article-excerpt"><em>${excerpt}</em></div>` : ''}
            </div>
            <div class="article-content">${content}</div>
        `;
        
        previewModal.classList.add('active');
    }

    // Close preview modal
    closePreview() {
        const previewModal = document.getElementById('previewModal');
        previewModal.classList.remove('active');
    }

    // Publish article modal
    publishArticle() {
        if (!this.validateArticle()) {
            return;
        }
        
        const publishModal = document.getElementById('publishModal');
        publishModal.classList.add('active');
    }

    // Close publish modal
    closePublish() {
        const publishModal = document.getElementById('publishModal');
        publishModal.classList.remove('active');
    }

    // Publish from preview
    publishFromPreview() {
        this.closePreview();
        this.publishArticle();
    }

    // Confirm and execute publish
    confirmPublish() {
        const publishType = document.querySelector('input[name="publishType"]:checked').value;
        const schedulePublish = document.getElementById('schedulePublish').checked;
        const publishDate = document.getElementById('publishDate').value;

        this.currentArticle.status = publishType;
        
        if (schedulePublish && publishDate) {
            this.currentArticle.publishDate = publishDate;
        } else if (!this.currentArticle.publishDate) {
            // Only set publish date if it's a new publication
            this.currentArticle.publishDate = new Date().toISOString();
        }

        // Save current form data to article
        this.currentArticle.title = document.getElementById('articleTitle').value;
        this.currentArticle.category = document.getElementById('articleCategory').value;
        this.currentArticle.tags = document.getElementById('articleTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        this.currentArticle.excerpt = document.getElementById('articleExcerpt').value;
        this.currentArticle.content = this.quill.root.innerHTML;

        // In a real app, this would generate the HTML file and update the writings list
        this.generateArticleFile();
        
        this.closePublish();
                    this.showToast('Article published successfully! HTML file will be downloaded.');
        
        // Redirect to writings page to see the published article
        setTimeout(() => {
            window.location.href = 'writings.html';
        }, 1500);
    }

    // Validate article before publishing
    validateArticle() {
        const title = document.getElementById('articleTitle').value.trim();
        const content = this.quill.getText().trim();

        if (!title) {
            alert('Please add a title to your article.');
            document.getElementById('articleTitle').focus();
            return false;
        }

        if (content.length < 100) {
            alert('Your article seems a bit short. Please add more content before publishing.');
            this.quill.focus();
            return false;
        }

        return true;
    }

    // Estimate reading time
    estimateReadingTime() {
        const text = this.quill.getText();
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        return Math.ceil(words / 200); // 200 words per minute average
    }

    // Generate article HTML file
    generateArticleFile() {
        const title = document.getElementById('articleTitle').value;
        const category = document.getElementById('articleCategory').value;
        const tags = document.getElementById('articleTags').value;
        const excerpt = document.getElementById('articleExcerpt').value;
        const content = this.quill.root.innerHTML;
        
        const slug = this.generateSlug(title);
        const htmlFilename = `${slug}.html`;
        
        // Use custom date if set, otherwise use current date
        const selectedDate = document.getElementById('articleDate').value;
        const publishDate = selectedDate ? new Date(selectedDate + 'T12:00:00').toISOString() : new Date().toISOString();
        
        const articleData = {
            title,
            category,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            excerpt,
            content,
            publishDate: publishDate,
            slug: slug,
            htmlFilename: htmlFilename
        };

        // Generate HTML file content
        const htmlContent = this.generateArticleHTML(articleData);
        
        // For demo purposes, save to localStorage with published status
        this.currentArticle = { ...this.currentArticle, ...articleData, status: 'published' };
        localStorage.setItem(`article_${this.currentArticle.id}`, JSON.stringify(this.currentArticle));
        
        // Save the HTML file (in a real implementation, this would be sent to a server)
        this.downloadArticleHTML(htmlContent, `${articleData.slug}.html`);
        
        // Automatically update writings.html page
        this.updateWritingsPage(articleData);
    }
    
    // Generate HTML content for the article
    generateArticleHTML(articleData) {
        const publishDate = new Date(articleData.publishDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const categoryDisplay = this.getCategoryDisplayName(articleData.category);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} - Leart Ajvazaj</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        .article-container {
            max-width: 800px;
            margin: 120px auto 60px;
            padding: 0 20px;
        }
        
        .article-meta {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #eee;
        }
        
        .article-date {
            color: #666;
            font-size: 0.9rem;
        }
        
        .article-category {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-left: 1rem;
        }
        
        .article-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #333;
            margin: 1rem 0;
            line-height: 1.3;
        }
        
        .article-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #444;
        }
        
        .article-content p {
            margin-bottom: 1.5rem;
        }
        
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .article-content blockquote {
            border-left: 4px solid #667eea;
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: #666;
        }
        
        .article-content code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        
        .article-content pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
        }
        
        .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        
        .article-footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
        }
        
        .article-tags {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .article-tag {
            background: #f0f0f0;
            color: #666;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
            margin-bottom: 2rem;
        }
        
        .back-link:hover {
            color: #5a67d8;
        }
        
        .article-excerpt {
            font-size: 1.2rem;
            color: #666;
            font-style: italic;
            margin-bottom: 2rem;
            padding: 1rem;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 0 8px 8px 0;
        }
        

        
        @media (max-width: 768px) {
            .article-title {
                font-size: 2rem;
            }
            
            .article-container {
                margin-top: 100px;
                padding: 0 15px;
            }
            
            .article-content {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="index.html">Leart Ajvazaj</a>
            </div>
            <div class="nav-menu" id="nav-menu">
                <a href="index.html" class="nav-link">Home</a>
                <a href="writings.html" class="nav-link">Writings</a>
                <a href="#papers" class="nav-link">Papers</a>
                <a href="#projects" class="nav-link">Projects</a>
                <a href="write.html" class="nav-link">Write</a>
                <a href="#about" class="nav-link">About</a>
            </div>
            <div class="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- Article Content -->
    <main class="article-container">
        <a href="writings.html" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Writings
        </a>
        
        <div class="article-meta">
            <span class="article-date">${publishDate}</span>
            ${articleData.category ? `<span class="article-category">${categoryDisplay}</span>` : ''}
        </div>
        
        <h1 class="article-title">${articleData.title}</h1>
        
        ${articleData.excerpt ? `<div class="article-excerpt">${articleData.excerpt}</div>` : ''}
        
        <div class="article-content">
            ${articleData.content}
        </div>
        
        ${articleData.tags && articleData.tags.length > 0 ? `
        <div class="article-footer">
            <div class="article-tags">
                ${articleData.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
        </div>
        ` : ''}
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="footer-links">
                        <a href="https://www.linkedin.com/in/leart-ajvazaj/" class="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://www.facebook.com/learti.a/" class="footer-link" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://x.com/LeartAjvazaj" class="footer-link" target="_blank" rel="noopener noreferrer">X</a>
                        <a href="mailto:ajvazaj.leart@gmail.com" class="footer-link">Email</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <div class="footer-links">
                        <a href="writings.html" class="footer-link">Writings</a>
                        <a href="technical.html" class="footer-link">Technical</a>
                        <a href="index.html#projects" class="footer-link">Projects</a>
                        <a href="faq-recommendations.html" class="footer-link">Recommendations</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Leart Ajvazaj. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
    }
    
    // Get display name for category
    getCategoryDisplayName(category) {
        const categoryMap = {
            'machine-learning': 'Machine Learning',
            'mathematics': 'Mathematics',
            'philosophy': 'Philosophy',
            'technology': 'Technology',
            'politics': 'Politics',
            'personal': 'Personal'
        };
        return categoryMap[category] || category || 'Personal';
    }
    
    // Download the HTML file (for demo purposes)
    downloadArticleHTML(htmlContent, filename) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show instruction to user
        this.showToast(`HTML file downloaded! Place "${filename}" in your website folder. Articles with HTML files will open as dedicated pages instead of modals.`);
    }

    // Generate URL slug from title
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update writings.html page with new article
    updateWritingsPage(articleData) {
        try {
            // Format the publish date
            const publishDate = new Date(articleData.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Get category display name
            const categoryDisplay = this.getCategoryDisplayName(articleData.category);
            
            // Create the article card HTML
            const articleCard = `
                    <article class="writing-card" data-category="${articleData.category}">
                        <div class="card-meta">
                            <span class="date">${publishDate}</span>
                            <span class="category">${categoryDisplay}</span>
                        </div>
                        <h3 class="card-title">
                            <a href="${articleData.htmlFilename}">${articleData.title}</a>
                        </h3>
                        <p class="card-excerpt">
                            ${articleData.excerpt}
                        </p>
                        <a href="${articleData.htmlFilename}" class="read-more">Read More</a>
                    </article>`;
            
            // Generate updated writings.html content
            const updatedWritingsHTML = this.generateUpdatedWritingsHTML(articleCard);
            
            // Download the updated writings.html file
            const blob = new Blob([updatedWritingsHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'writings.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`Article published! Don't forget to replace the writings.html file in your website folder.`);
            
        } catch (error) {
            console.error('Error updating writings page:', error);
            this.showToast('Article published! Manually add to writings.html if needed.');
        }
    }
    
    // Generate updated writings.html with new article
    generateUpdatedWritingsHTML(newArticleCard) {
        // This is a template for the writings.html file with the new article inserted
        // In a real implementation, you would fetch the current writings.html and parse it
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Writings - Leart Ajvazaj</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Articles and writings by Leart Ajvazaj on mathematics, machine learning, and research. Explore insights on mathematical thinking and computational theory.">
    <meta name="keywords" content="Leart Ajvazaj, writings, articles, mathematics, machine learning, research, blog, mathematical thinking">
    <meta name="author" content="Leart Ajvazaj">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph Tags (Social Media) -->
    <meta property="og:title" content="Writings - Leart Ajvazaj">
    <meta property="og:description" content="Articles and writings on mathematics, machine learning, and research by Leart Ajvazaj.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yourdomain.com/writings.html">
    <meta property="og:site_name" content="Leart Ajvazaj">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Writings - Leart Ajvazaj">
    <meta name="twitter:description" content="Articles and writings on mathematics, machine learning, and research.">
    <meta name="twitter:creator" content="@LeartAjvazaj">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://yourdomain.com/writings.html">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="medium-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        .admin-only {
            display: none;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="index.html">Leart Ajvazaj</a>
            </div>
            <div class="nav-menu" id="nav-menu">
                <a href="index.html" class="nav-link">Home</a>
                <a href="writings.html" class="nav-link active">Writings</a>
                <a href="technical.html" class="nav-link">Technical</a>
                <a href="faq-recommendations.html" class="nav-link">Recommendations</a>
                <a href="write.html" class="nav-link admin-only">Write</a>
                <a href="index.html#about" class="nav-link">About</a>
            </div>
            <div class="hamburger" id="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <main style="padding-top: 70px;">
        <section class="section">
            <div class="container">
                <div class="page-header">
                    <h1 class="page-title">My Writings</h1>
                    <p class="page-subtitle">
                        Thoughts on machine learning, mathematics, and the intersection of technology and humanity.
                    </p>
                </div>

                <!-- Filter buttons -->
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="machine-learning">Machine Learning</button>
                    <button class="filter-btn" data-filter="mathematics">Mathematics</button>
                    <button class="filter-btn" data-filter="philosophy">Philosophy</button>
                    <button class="filter-btn" data-filter="politics">Politics</button>
                    <button class="filter-btn" data-filter="technology">Technology</button>
                </div>

                <!-- Writings Grid -->
                <div class="writings-grid">
${newArticleCard}

                    <!-- Albanian Politics Article - Always visible, content in Albanian -->
                    <article class="writing-card" data-category="politics">
                        <div class="card-meta">
                            <span class="date">April 4, 2022</span>
                            <span class="category">Politics</span>
                        </div>
                        <h3 class="card-title">
                            <a href="mos-e-lexo-kete-shkrim.html">Mos e lexo këtë shkrim—Është për politikë</a>
                        </h3>
                        <p class="card-excerpt">

                        </p>
                        <a href="mos-e-lexo-kete-shkrim.html" class="read-more">Read More</a>
                    </article>

                    <!-- Other existing articles would be preserved here -->
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="footer-links">
                        <a href="https://www.linkedin.com/in/leart-ajvazaj/" class="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://www.facebook.com/learti.a/" class="footer-link" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://x.com/LeartAjvazaj" class="footer-link" target="_blank" rel="noopener noreferrer">X</a>
                        <a href="mailto:ajvazaj.leart@gmail.com" class="footer-link">Email</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <div class="footer-links">
                        <a href="writings.html" class="footer-link">Writings</a>
                        <a href="technical.html" class="footer-link">Technical</a>
                        <a href="faq-recommendations.html" class="footer-link">Recommendations</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Leart Ajvazaj. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="admin-auth.js"></script>
    <script src="script.js"></script>
    <script src="writings.js"></script>
</body>
</html>`;
    }

    // Cleanup
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Global functions for HTML onclick handlers
function saveDraft() {
    if (window.writer) {
        window.writer.saveDraft();
    }
}

function previewArticle() {
    if (window.writer) {
        window.writer.previewArticle();
    }
}

function closePreview() {
    if (window.writer) {
        window.writer.closePreview();
    }
}

function publishArticle() {
    if (window.writer) {
        window.writer.publishArticle();
    }
}

function closePublish() {
    if (window.writer) {
        window.writer.closePublish();
    }
}

function publishFromPreview() {
    if (window.writer) {
        window.writer.publishFromPreview();
    }
}

function confirmPublish() {
    if (window.writer) {
        window.writer.confirmPublish();
    }
}

// Set today's date in the date input
function setTodayDate() {
    const dateInput = document.getElementById('articleDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Update the article writer instance if it exists
    if (window.writer) {
        window.writer.currentArticle.customDate = today;
        window.writer.isModified = true;
        window.writer.updateSaveStatus('Modified');
    }
}

// Initialize writer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication first
    if (!window.adminAuth || !window.adminAuth.isAdmin()) {
        // Redirect to home page if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Apply theme from homepage
    initializeWriterTheme();
    
    window.writer = new ArticleWriter();
});

// Theme management for writer interface
function initializeWriterTheme() {
    // Get theme from homepage settings
    const storedTheme = localStorage.getItem('theme-preference');
    const manualTheme = localStorage.getItem('manual-theme');
    const autoTheme = localStorage.getItem('auto-theme');
    
    let currentTheme = 'light'; // default
    
    if (storedTheme === 'manual' && manualTheme) {
        currentTheme = manualTheme;
    } else if (autoTheme) {
        currentTheme = autoTheme;
    } else {
        // If no theme is set, use time-based theme like homepage
        const now = new Date();
        const hour = now.getHours();
        currentTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
    }
    
    applyWriterTheme(currentTheme);
}

function applyWriterTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific styles to writer interface
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Add writer-specific dark theme styles
const writerThemeStyles = document.createElement('style');
writerThemeStyles.textContent = `
    /* Dark theme styles for writer interface */
    .dark-theme {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
    }
    
    .dark-theme .navbar {
        background: rgba(26, 26, 26, 0.95) !important;
        border-bottom: 1px solid #333 !important;
    }
    
    .dark-theme .nav-link {
        color: #e0e0e0 !important;
    }
    
    .dark-theme .nav-link:hover,
    .dark-theme .nav-link.active {
        color: #667eea !important;
    }
    
    .dark-theme .writer-main {
        background: #1a1a1a !important;
    }
    
    .dark-theme .writer-container {
        background: #1a1a1a !important;
    }
    
    .dark-theme .writer-header {
        background: #2d2d2d !important;
        border-bottom: 1px solid #404040 !important;
    }
    
    .dark-theme .article-metadata {
        background: #2d2d2d !important;
        border: 1px solid #404040 !important;
    }
    
    .dark-theme .title-input,
    .dark-theme .category-select,
    .dark-theme .tags-input,
    .dark-theme .excerpt-input,
    .dark-theme .date-input {
        background: #333 !important;
        color: #e0e0e0 !important;
        border: 1px solid #555 !important;
    }
    
    .dark-theme .title-input::placeholder,
    .dark-theme .tags-input::placeholder,
    .dark-theme .excerpt-input::placeholder {
        color: #888 !important;
    }
    
    .dark-theme .editor-container {
        background: #2d2d2d !important;
        border: 1px solid #404040 !important;
    }
    
    .dark-theme .ql-toolbar {
        background: #333 !important;
        border-bottom: 1px solid #555 !important;
    }
    
    .dark-theme .ql-container {
        background: #2d2d2d !important;
        color: #e0e0e0 !important;
    }
    
    .dark-theme .ql-editor {
        color: #e0e0e0 !important;
    }
    
    .dark-theme .ql-editor.ql-blank::before {
        color: #888 !important;
    }
    
    .dark-theme .ql-toolbar .ql-stroke {
        stroke: #e0e0e0 !important;
    }
    
    .dark-theme .ql-toolbar .ql-fill {
        fill: #e0e0e0 !important;
    }
    
    .dark-theme .ql-toolbar button {
        color: #e0e0e0 !important;
    }
    
    .dark-theme .ql-toolbar button:hover {
        background: #555 !important;
    }
    
    .dark-theme .ql-toolbar .ql-active {
        background: #667eea !important;
    }
    
    .dark-theme .upload-area {
        background: #2d2d2d !important;
        border: 2px dashed #555 !important;
        color: #e0e0e0 !important;
    }
    
    .dark-theme .upload-area:hover,
    .dark-theme .upload-area.dragover {
        border-color: #667eea !important;
        background: #333 !important;
    }
    
    .dark-theme .preview-modal,
    .dark-theme .publish-modal {
        background: rgba(0, 0, 0, 0.9) !important;
    }
    
    .dark-theme .preview-content,
    .dark-theme .publish-content {
        background: #2d2d2d !important;
        color: #e0e0e0 !important;
        border: 1px solid #404040 !important;
    }
    
    .dark-theme .preview-header,
    .dark-theme .publish-header {
        background: #333 !important;
        border-bottom: 1px solid #555 !important;
    }
    
    .dark-theme .preview-footer,
    .dark-theme .publish-footer {
        background: #333 !important;
        border-top: 1px solid #555 !important;
    }
    
    .dark-theme .close-preview,
    .dark-theme .close-publish {
        color: #e0e0e0 !important;
    }
    
    .dark-theme .close-preview:hover,
    .dark-theme .close-publish:hover {
        background: #555 !important;
    }
    
    .dark-theme .publish-option {
        background: #333 !important;
        border: 1px solid #555 !important;
    }
    
    .dark-theme .publish-option:hover {
        background: #404040 !important;
    }
    
    .dark-theme .publish-option input[type="radio"]:checked + .option-content {
        background: #667eea !important;
    }
    
    .dark-theme .publish-note {
        background: #333 !important;
        border: 1px solid #555 !important;
        color: #ccc !important;
    }
    
    .dark-theme .success-toast {
        background: #2d2d2d !important;
        color: #e0e0e0 !important;
        border: 1px solid #404040 !important;
    }
    
    .dark-theme .today-btn {
        background: #667eea !important;
        color: white !important;
        border: none !important;
    }
    
    .dark-theme .today-btn:hover {
        background: #5a67d8 !important;
    }
    
    .dark-theme .btn-primary {
        background: #667eea !important;
        color: white !important;
    }
    
    .dark-theme .btn-primary:hover {
        background: #5a67d8 !important;
    }
    
    .dark-theme .btn-secondary {
        background: #6c757d !important;
        color: white !important;
    }
    
    .dark-theme .btn-secondary:hover {
        background: #5a6268 !important;
    }
    
    .dark-theme #saveStatus,
    .dark-theme #wordCount {
        color: #ccc !important;
    }
    
    .dark-theme .date-input-group label {
        color: #e0e0e0 !important;
    }
`;
document.head.appendChild(writerThemeStyles);

// Save draft before leaving page
window.addEventListener('beforeunload', (e) => {
    if (window.writer && window.writer.isModified) {
        window.writer.saveDraft(true);
        e.preventDefault();
        e.returnValue = '';
    }
}); 