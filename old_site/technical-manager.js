// Technical Work Manager JavaScript

class TechnicalWorkManager {
    constructor() {
        this.currentWork = {
            id: null,
            title: '',
            type: '',
            date: '',
            authors: '',
            instructor: '',
            venue: '',
            abstract: '',
            tags: [],
            pdfFile: null,
            texFile: null,
            pdfPath: '',
            texPath: '',
            arxivLink: '',
            codeLink: '',
            conferenceLink: '',
            slidesLink: '',
            status: 'draft',
            createdAt: null,
            updatedAt: null
        };
        this.isEditMode = false;
        this.editingId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingWorks();
        this.setupFileUploads();
        this.setupFormValidation();
        
        // Apply theme from homepage
        this.initializeTheme();
    }

    initializeTheme() {
        // Get theme from homepage settings
        const storedTheme = localStorage.getItem('theme-preference');
        const manualTheme = localStorage.getItem('manual-theme');
        const autoTheme = localStorage.getItem('auto-theme');
        
        let currentTheme = 'light';
        
        if (storedTheme === 'manual' && manualTheme) {
            currentTheme = manualTheme;
        } else if (autoTheme) {
            currentTheme = autoTheme;
        } else {
            const now = new Date();
            const hour = now.getHours();
            currentTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        }
        
        this.applyTheme(currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    setupEventListeners() {
        // Form inputs
        document.getElementById('workTitle').addEventListener('input', () => this.updatePreview());
        document.getElementById('workType').addEventListener('change', () => this.updatePreview());
        document.getElementById('workDate').addEventListener('input', () => this.updatePreview());
        document.getElementById('workAuthors').addEventListener('input', () => this.updatePreview());
        document.getElementById('workInstructor').addEventListener('input', () => this.updatePreview());
        document.getElementById('workVenue').addEventListener('input', () => this.updatePreview());
        document.getElementById('workAbstract').addEventListener('input', () => this.updatePreview());
        document.getElementById('workTags').addEventListener('input', () => this.updatePreview());
        
        // Links
        document.getElementById('arxivLink').addEventListener('input', () => this.updatePreview());
        document.getElementById('codeLink').addEventListener('input', () => this.updatePreview());
        document.getElementById('conferenceLink').addEventListener('input', () => this.updatePreview());
        document.getElementById('slidesLink').addEventListener('input', () => this.updatePreview());

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterWorks(e.target.dataset.filter));
        });
    }

    setupFileUploads() {
        // PDF upload
        const pdfUploadArea = document.getElementById('pdfUploadArea');
        const pdfFileInput = document.getElementById('pdfFile');
        
        pdfUploadArea.addEventListener('click', () => pdfFileInput.click());
        pdfUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        pdfUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e, 'pdf'));
        pdfFileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'pdf'));

        // TeX upload
        const texUploadArea = document.getElementById('texUploadArea');
        const texFileInput = document.getElementById('texFile');
        
        texUploadArea.addEventListener('click', () => texFileInput.click());
        texUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        texUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e, 'tex'));
        texFileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'tex'));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e, type) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0], type);
        }
    }

    handleFileSelect(e, type) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file, type);
        }
    }

    processFile(file, type) {
        // Validate file type and size
        if (type === 'pdf') {
            if (!file.type.includes('pdf')) {
                this.showToast('Please select a PDF file', 'error');
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB
                this.showToast('PDF file size must be less than 50MB', 'error');
                return;
            }
        } else if (type === 'tex') {
            const validTypes = ['text/plain', 'application/x-tex', 'application/zip'];
            if (!validTypes.some(t => file.type.includes(t)) && !file.name.match(/\.(tex|zip)$/i)) {
                this.showToast('Please select a .tex or .zip file', 'error');
                return;
            }
            if (file.size > 25 * 1024 * 1024) { // 25MB
                this.showToast('TeX file size must be less than 25MB', 'error');
                return;
            }
        }

        // Store file and show info
        this.currentWork[`${type}File`] = file;
        this.showFileInfo(file, type);
        this.updatePreview();
    }

    showFileInfo(file, type) {
        const fileInfo = document.getElementById(`${type}FileInfo`);
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        fileInfo.innerHTML = `
            <div class="file-item">
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize} MB</span>
                </div>
                <button class="remove-file" onclick="manager.removeFile('${type}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileInfo.style.display = 'block';
    }

    removeFile(type) {
        this.currentWork[`${type}File`] = null;
        document.getElementById(`${type}FileInfo`).style.display = 'none';
        document.getElementById(`${type}File`).value = '';
        this.updatePreview();
    }

    setupFormValidation() {
        const requiredFields = ['workTitle', 'workType', 'workDate', 'workAbstract'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('blur', () => this.validateField(field));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value.length > 0;
        
        field.classList.toggle('invalid', !isValid);
        return isValid;
    }

    validateForm() {
        const requiredFields = ['workTitle', 'workType', 'workDate', 'workAbstract'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // At least PDF file is required
        if (!this.currentWork.pdfFile && !this.currentWork.pdfPath) {
            this.showToast('PDF file is required', 'error');
            isValid = false;
        }

        return isValid;
    }

    updatePreview() {
        const preview = document.getElementById('workPreview');
        const data = this.collectFormData();
        
        if (!data.title) {
            preview.innerHTML = '<p class="preview-placeholder">Fill in the form to see preview</p>';
            return;
        }

        const categoryDisplay = this.getCategoryDisplay(data.type);
        const authorsHtml = data.authors ? `<i class="fas fa-user"></i> ${data.authors}` : '';
        const instructorHtml = data.instructor ? ` • <i class="fas fa-chalkboard-teacher"></i> ${data.instructor}` : '';
        const tagsHtml = data.tags.length > 0 ? 
            `<div class="card-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

        const actionsHtml = this.generateActionsPreview(data);

        preview.innerHTML = `
            <article class="technical-card preview-card">
                <div class="card-meta">
                    <span class="date">${data.date}</span>
                    <span class="category">${categoryDisplay}</span>
                    <span class="venue">${data.venue || 'Institution/Venue'}</span>
                </div>
                <h3 class="card-title">${data.title}</h3>
                <p class="card-authors">${authorsHtml}${instructorHtml}</p>
                <p class="card-abstract">${data.abstract || 'Abstract will appear here...'}</p>
                ${tagsHtml}
                <div class="card-actions">${actionsHtml}</div>
            </article>
        `;
    }

    generateActionsPreview(data) {
        let actions = [];
        
        if (this.currentWork.pdfFile || this.currentWork.pdfPath) {
            actions.push(`<a href="#" class="action-btn primary"><i class="fas fa-file-pdf"></i> View PDF</a>`);
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-download"></i> Download PDF</a>`);
        }
        
        if (this.currentWork.texFile || this.currentWork.texPath) {
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-code"></i> LaTeX Source</a>`);
        }
        
        if (data.arxivLink) {
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-external-link-alt"></i> arXiv</a>`);
        }
        
        if (data.codeLink) {
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-code"></i> Code</a>`);
        }
        
        if (data.conferenceLink) {
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-external-link-alt"></i> Conference</a>`);
        }
        
        if (data.slidesLink) {
            actions.push(`<a href="#" class="action-btn secondary"><i class="fas fa-file-powerpoint"></i> Slides</a>`);
        }

        return actions.join('');
    }

    getCategoryDisplay(type) {
        const categories = {
            'papers': 'Research Paper',
            'notes': 'Class Notes',
            'preprints': 'Preprint',
            'presentations': 'Presentation'
        };
        return categories[type] || type;
    }

    collectFormData() {
        return {
            title: document.getElementById('workTitle').value.trim(),
            type: document.getElementById('workType').value,
            date: document.getElementById('workDate').value.trim(),
            authors: document.getElementById('workAuthors').value.trim(),
            instructor: document.getElementById('workInstructor').value.trim(),
            venue: document.getElementById('workVenue').value.trim(),
            abstract: document.getElementById('workAbstract').value.trim(),
            tags: document.getElementById('workTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            arxivLink: document.getElementById('arxivLink').value.trim(),
            codeLink: document.getElementById('codeLink').value.trim(),
            conferenceLink: document.getElementById('conferenceLink').value.trim(),
            slidesLink: document.getElementById('slidesLink').value.trim()
        };
    }

    loadExistingWorks() {
        const works = this.getSavedWorks();
        this.displayWorks(works);
    }

    getSavedWorks() {
        const works = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('technical_work_')) {
                try {
                    const work = JSON.parse(localStorage.getItem(key));
                    works.push(work);
                } catch (e) {
                    console.error('Error parsing saved work:', e);
                }
            }
        }
        return works.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    displayWorks(works) {
        const worksList = document.getElementById('worksList');
        
        if (works.length === 0) {
            worksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Technical Works Yet</h3>
                    <p>Click "Add New Work" to create your first technical work entry.</p>
                </div>
            `;
            return;
        }

        worksList.innerHTML = works.map(work => this.createWorkCard(work)).join('');
    }

    createWorkCard(work) {
        const categoryDisplay = this.getCategoryDisplay(work.type);
        const authorsHtml = work.authors ? `<i class="fas fa-user"></i> ${work.authors}` : '';
        const instructorHtml = work.instructor ? ` • <i class="fas fa-chalkboard-teacher"></i> ${work.instructor}` : '';
        const tagsHtml = work.tags && work.tags.length > 0 ? 
            `<div class="card-tags">${work.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

        return `
            <div class="work-card" data-category="${work.type}">
                <div class="work-header">
                    <div class="work-meta">
                        <span class="date">${work.date}</span>
                        <span class="category">${categoryDisplay}</span>
                        <span class="venue">${work.venue || ''}</span>
                    </div>
                    <div class="work-actions">
                        <button class="action-btn-small" onclick="manager.editWork('${work.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-small danger" onclick="manager.deleteWork('${work.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h3 class="work-title">${work.title}</h3>
                <p class="work-authors">${authorsHtml}${instructorHtml}</p>
                <p class="work-abstract">${work.abstract}</p>
                ${tagsHtml}
                <div class="work-files">
                    ${work.pdfPath ? '<span class="file-indicator"><i class="fas fa-file-pdf"></i> PDF</span>' : ''}
                    ${work.texPath ? '<span class="file-indicator"><i class="fas fa-code"></i> TeX</span>' : ''}
                    ${work.arxivLink ? '<span class="file-indicator"><i class="fas fa-external-link-alt"></i> arXiv</span>' : ''}
                    ${work.codeLink ? '<span class="file-indicator"><i class="fas fa-code"></i> Code</span>' : ''}
                </div>
                <div class="work-status">
                    Status: <span class="status-badge ${work.status}">${work.status}</span>
                    <small>Updated: ${new Date(work.updatedAt).toLocaleDateString()}</small>
                </div>
            </div>
        `;
    }

    filterWorks(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        const works = this.getSavedWorks();
        const filteredWorks = filter === 'all' ? works : works.filter(work => work.type === filter);
        this.displayWorks(filteredWorks);
    }

    saveWork() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.collectFormData();
        const workId = this.editingId || this.generateId();
        
        const work = {
            id: workId,
            ...formData,
            pdfPath: this.currentWork.pdfPath || '',
            texPath: this.currentWork.texPath || '',
            status: 'published',
            createdAt: this.isEditMode ? this.currentWork.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Handle file uploads and generate file paths
        if (this.currentWork.pdfFile) {
            work.pdfPath = `papers/${this.generateFileName(formData.title, 'pdf')}`;
            this.simulateFileUpload(this.currentWork.pdfFile, work.pdfPath);
        }
        
        if (this.currentWork.texFile) {
            work.texPath = `papers/${this.generateFileName(formData.title, 'tex')}`;
            this.simulateFileUpload(this.currentWork.texFile, work.texPath);
        }

        // Generate preview page HTML filename
        const previewPageName = this.generatePreviewPageName(formData.title);
        work.previewPagePath = `${previewPageName}.html`;

        // Save to localStorage
        localStorage.setItem(`technical_work_${workId}`, JSON.stringify(work));

        // Generate preview page
        this.generatePreviewPage(work, previewPageName);
        
        // Generate main HTML file for the work
        this.generateWorkHTMLFile(work);
        
        // Automatically update technical.js with new work
        this.updateTechnicalJSFile(work);

        this.showToast(this.isEditMode ? 'Work updated successfully!' : 'Work added successfully!');
        this.closeForm();
        this.loadExistingWorks();
        this.resetForm();
    }

    simulateFileUpload(file, path) {
        // In a real implementation, this would upload the file to a server
        // For now, we'll just store a reference
        console.log(`Simulating upload of ${file.name} to ${path}`);
    }

    generateFileName(title, extension) {
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '_')
            .replace(/-+/g, '-')
            .trim('-');
        return `${slug}.${extension}`;
    }

    generatePreviewPageName(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '_')
            .replace(/-+/g, '-')
            .trim('-');
    }

    generatePreviewPage(work, fileName) {
        const html = this.createPreviewPageHTML(work);
        
        // In a browser environment, we can't directly write files
        // Instead, we'll provide a download link and show instructions
        this.createDownloadablePreviewPage(html, fileName);
        
        // Also store the HTML content in localStorage for potential future use
        localStorage.setItem(`preview_page_${work.id}`, html);
    }

    createDownloadablePreviewPage(html, fileName) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.html`;
        
        // Show user notification about the generated page
        this.showPreviewPageNotification(fileName, url);
    }

    showPreviewPageNotification(fileName, downloadUrl) {
        const notification = document.createElement('div');
        notification.className = 'preview-page-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <i class="fas fa-file-code"></i>
                    <h4>Preview Page Generated!</h4>
                </div>
                <p>A preview page has been created for your technical work.</p>
                <div class="notification-actions">
                    <a href="${downloadUrl}" download="${fileName}.html" class="btn-primary">
                        <i class="fas fa-download"></i> Download ${fileName}.html
                    </a>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-secondary">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
                <div class="notification-instructions">
                    <small>
                        <i class="fas fa-info-circle"></i>
                        Save this file to your website directory to make it accessible at ${fileName}.html
                    </small>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 30000);
    }

    createPreviewPageHTML(work) {
        const title = work.title || 'Technical Work';
        const fileName = this.generatePreviewPageName(title);
        const authors = work.authors || 'Author';
        const date = work.date || 'Date';
        const venue = work.venue || '';
        const abstract = work.abstract || '';
        const pdfPath = work.pdfPath || `papers/${fileName}.pdf`;
        const texPath = work.texPath || '';
        
        const metaLine = [authors, date, venue].filter(item => item).join(' • ');
        
        // Generate action buttons based on available links
        let actionButtons = [];
        
        if (work.pdfPath) {
            actionButtons.push(`
                <a href="${pdfPath}" download class="btn-primary">
                    <i class="fas fa-download"></i>
                    Download PDF
                </a>
            `);
        }
        
        if (work.texPath) {
            actionButtons.push(`
                <a href="${texPath}" download class="btn-secondary">
                    <i class="fas fa-file-alt"></i>
                    Download TeX
                </a>
            `);
        }
        
        if (work.arxivLink && work.arxivLink !== '#' && work.arxivLink !== '') {
            actionButtons.push(`
                <a href="${work.arxivLink}" target="_blank" class="btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    arXiv
                </a>
            `);
        }
        
        if (work.codeLink && work.codeLink !== '#' && work.codeLink !== '') {
            actionButtons.push(`
                <a href="${work.codeLink}" target="_blank" class="btn-secondary">
                    <i class="fas fa-code"></i>
                    Code
                </a>
            `);
        }
        
        if (work.conferenceLink && work.conferenceLink !== '#' && work.conferenceLink !== '') {
            actionButtons.push(`
                <a href="${work.conferenceLink}" target="_blank" class="btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    Conference
                </a>
            `);
        }
        
        if (work.slidesLink && work.slidesLink !== '#' && work.slidesLink !== '') {
            actionButtons.push(`
                <a href="${work.slidesLink}" target="_blank" class="btn-secondary">
                    <i class="fas fa-file-powerpoint"></i>
                    Slides
                </a>
            `);
        }
        
        // Add "View Below" button if PDF is available
        if (work.pdfPath) {
            actionButtons.push(`
                <a href="#pdf-viewer" class="btn-secondary">
                    <i class="fas fa-eye"></i>
                    View Below
                </a>
            `);
        }
        
        const actionsHTML = actionButtons.join('\n                    ');
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - PDF | Leart Ajvazaj</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <style>
        .pdf-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .pdf-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pdf-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .pdf-meta {
            font-size: 1.1rem;
            color: var(--text-light);
            margin-bottom: 1rem;
        }

        .pdf-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1.5rem;
        }

        .pdf-viewer {
            width: 100%;
            height: 80vh;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            background: var(--card-bg);
        }

        .pdf-fallback {
            text-align: center;
            padding: 3rem;
            background: var(--card-bg);
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pdf-fallback h3 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        .pdf-fallback p {
            color: var(--text-light);
            margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
            .pdf-container {
                padding: 1rem;
            }
            
            .pdf-title {
                font-size: 2rem;
            }
            
            .pdf-viewer {
                height: 70vh;
            }
            
            .pdf-actions {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">
                <i class="fas fa-code"></i>
                Leart Ajvazaj
            </a>
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li><a href="writings.html" class="nav-link">Writings</a></li>
                <li><a href="technical.html" class="nav-link">Technical</a></li>
            </ul>
        </div>
    </nav>

    <main class="main-content">
        <div class="pdf-container">
            <div class="pdf-header">
                <h1 class="pdf-title">${title}</h1>
                <div class="pdf-meta">
                    <strong>${metaLine}</strong>
                </div>
                <p style="max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    ${abstract}
                </p>
                <div class="pdf-actions">
                    ${actionsHTML}
                </div>
            </div>

            ${work.pdfPath ? `
            <div id="pdf-viewer">
                <embed 
                    src="${pdfPath}" 
                    type="application/pdf" 
                    class="pdf-viewer"
                    title="${title} PDF">
                </embed>
                
                <!-- Fallback for browsers that don't support embed (hidden by default) -->
                <div class="pdf-fallback" id="pdf-fallback" style="display: none;">
                    <h3><i class="fas fa-file-pdf"></i> PDF Viewer Not Supported</h3>
                    <p>Your browser doesn't support embedded PDFs. Please download the file to view it.</p>
                    <a href="${pdfPath}" download class="btn-primary">
                        <i class="fas fa-download"></i>
                        Download PDF
                    </a>
                </div>
            </div>
            ` : ''}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Leart Ajvazaj</h3>
                    <p>Mathematics & Computer Science</p>
                </div>
                <div class="footer-section">
                    <h3>Connect</h3>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-github"></i></a>
                        <a href="#" class="social-link"><svg class="x-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Leart Ajvazaj. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Initialize theme
        const currentTheme = localStorage.getItem('theme') || 'auto';
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Smooth scroll to PDF viewer
        document.querySelector('a[href="#pdf-viewer"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('pdf-viewer').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });

        // Check if PDF embed is working, show fallback if not
        document.addEventListener('DOMContentLoaded', () => {
            const embed = document.querySelector('embed[type="application/pdf"]');
            const fallback = document.getElementById('pdf-fallback');
            
            // Check after a short delay to see if PDF loaded
            setTimeout(() => {
                try {
                    // If embed has no content or failed to load, show fallback
                    if (!embed || embed.offsetHeight === 0 || embed.offsetWidth === 0) {
                        embed?.style.setProperty('display', 'none');
                        fallback?.style.setProperty('display', 'block');
                    }
                } catch (error) {
                    // If there's any error, show fallback
                    embed?.style.setProperty('display', 'none');
                    fallback?.style.setProperty('display', 'block');
                }
            }, 1000);
        });
    </script>
</body>
</html>`;
    }

    editWork(workId) {
        const work = JSON.parse(localStorage.getItem(`technical_work_${workId}`));
        if (!work) return;

        this.isEditMode = true;
        this.editingId = workId;
        this.currentWork = { ...work };

        // Populate form
        document.getElementById('workTitle').value = work.title || '';
        document.getElementById('workType').value = work.type || '';
        document.getElementById('workDate').value = work.date || '';
        document.getElementById('workAuthors').value = work.authors || '';
        document.getElementById('workInstructor').value = work.instructor || '';
        document.getElementById('workVenue').value = work.venue || '';
        document.getElementById('workAbstract').value = work.abstract || '';
        document.getElementById('workTags').value = work.tags ? work.tags.join(', ') : '';
        document.getElementById('arxivLink').value = work.arxivLink || '';
        document.getElementById('codeLink').value = work.codeLink || '';
        document.getElementById('conferenceLink').value = work.conferenceLink || '';
        document.getElementById('slidesLink').value = work.slidesLink || '';

        // Update UI
        document.getElementById('formTitle').textContent = 'Edit Technical Work';
        document.getElementById('saveWorkBtn').textContent = 'Update Work';
        
        this.showForm();
        this.updatePreview();
    }

    deleteWork(workId) {
        const work = JSON.parse(localStorage.getItem(`technical_work_${workId}`));
        if (!work) return;

        document.getElementById('deleteWorkInfo').innerHTML = `
            <strong>"${work.title}"</strong><br>
            <small>${this.getCategoryDisplay(work.type)} • ${work.date}</small>
        `;
        
        this.showDeleteModal(workId);
    }

    showDeleteModal(workId) {
        document.getElementById('deleteModal').style.display = 'flex';
        this.deleteWorkId = workId;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.deleteWorkId = null;
    }

    confirmDelete() {
        if (this.deleteWorkId) {
            localStorage.removeItem(`technical_work_${this.deleteWorkId}`);
            this.loadExistingWorks();
            this.closeDeleteModal();
            this.showToast('Work deleted successfully');
        }
    }

    showForm() {
        document.getElementById('addEditForm').style.display = 'block';
        document.getElementById('addEditForm').scrollIntoView({ behavior: 'smooth' });
    }

    closeForm() {
        document.getElementById('addEditForm').style.display = 'none';
        this.resetForm();
    }

    resetForm() {
        this.isEditMode = false;
        this.editingId = null;
        this.currentWork = {
            id: null,
            title: '',
            type: '',
            date: '',
            authors: '',
            instructor: '',
            venue: '',
            abstract: '',
            tags: [],
            pdfFile: null,
            texFile: null,
            pdfPath: '',
            texPath: '',
            arxivLink: '',
            codeLink: '',
            conferenceLink: '',
            slidesLink: '',
            status: 'draft',
            createdAt: null,
            updatedAt: null
        };

        // Reset form
        document.querySelector('#addEditForm form')?.reset() || 
        document.querySelectorAll('#addEditForm input, #addEditForm select, #addEditForm textarea').forEach(el => {
            el.value = '';
            el.classList.remove('invalid');
        });

        // Reset file uploads
        document.getElementById('pdfFileInfo').style.display = 'none';
        document.getElementById('texFileInfo').style.display = 'none';
        document.getElementById('pdfFile').value = '';
        document.getElementById('texFile').value = '';

        // Reset UI
        document.getElementById('formTitle').textContent = 'Add New Technical Work';
        document.getElementById('saveWorkBtn').textContent = 'Save Work';
        document.getElementById('workPreview').innerHTML = '<p class="preview-placeholder">Fill in the form to see preview</p>';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('successToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toast.className = `toast ${type}-toast`;
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Generate main HTML file for the technical work
    generateWorkHTMLFile(work) {
        try {
            // Create filename from title
            const fileName = work.title.toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '_')
                .replace(/-+/g, '_')
                .trim('_');
            
            // Generate the HTML content
            const htmlContent = this.generateWorkHTMLContent(work);
            
            // Download the HTML file
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error generating work HTML file:', error);
        }
    }
    
    // Generate HTML content for the work (like galois_theory_notes.html)
    generateWorkHTMLContent(work) {
        const fileName = work.title.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '_')
            .replace(/-+/g, '_')
            .trim('_');
            
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${work.title} - PDF | Leart Ajvazaj</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <style>
        .pdf-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .pdf-header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pdf-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .pdf-meta {
            font-size: 1.1rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
        }

        .pdf-description {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--text-color);
            max-width: 800px;
            margin: 0 auto;
        }

        .pdf-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            flex-wrap: wrap;
        }

        .pdf-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .pdf-btn:hover {
            background: var(--secondary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .pdf-btn.secondary {
            background: transparent;
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }

        .pdf-btn.secondary:hover {
            background: var(--primary-color);
            color: white;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 500;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .pdf-container {
                padding: 1rem;
            }
            
            .pdf-title {
                font-size: 2rem;
            }
            
            .pdf-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .pdf-btn {
                width: 200px;
                justify-content: center;
            }
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
                <a href="writings.html" class="nav-link">Writings</a>
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
        <div class="pdf-container">
            <a href="technical.html" class="back-link">
                <i class="fas fa-arrow-left"></i>
                Back to Technical Work
            </a>
            
            <div class="pdf-header">
                <h1 class="pdf-title">${work.title}</h1>
                <div class="pdf-meta">
                    ${work.authors}${work.instructor ? ` • ${work.instructor}` : ''} • ${work.venue} • ${work.date}
                </div>
                <p class="pdf-description">
                    ${work.abstract}
                </p>
                <div class="pdf-actions">
                    ${work.pdfPath ? `<a href="${work.pdfPath}" class="pdf-btn" download>
                        <i class="fas fa-download"></i>
                        Download PDF
                    </a>` : ''}
                    ${work.texPath ? `<a href="${work.texPath}" class="pdf-btn secondary" download>
                        <i class="fas fa-code"></i>
                        LaTeX Source
                    </a>` : ''}
                    ${work.arxivLink ? `<a href="${work.arxivLink}" class="pdf-btn secondary" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i>
                        arXiv
                    </a>` : ''}
                    ${work.codeLink ? `<a href="${work.codeLink}" class="pdf-btn secondary" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i>
                        Code
                    </a>` : ''}
                </div>
            </div>
        </div>
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
</body>
</html>`;
    }
    
    // Update technical.js file with new work
    updateTechnicalJSFile(newWork) {
        try {
            // Create work object for technical.js format
            const technicalWork = {
                title: newWork.title,
                type: newWork.type,
                date: newWork.date,
                authors: newWork.authors,
                instructor: newWork.instructor || "",
                venue: newWork.venue,
                abstract: newWork.abstract,
                tags: newWork.tags,
                pdfPath: newWork.previewPagePath || `${newWork.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`,
                downloadPdf: newWork.pdfPath || "",
                texPath: newWork.texPath || "",
                isStatic: true
            };
            
            // Generate updated technical.js content
            const updatedTechnicalJS = this.generateUpdatedTechnicalJS(technicalWork);
            
            // Download the updated technical.js file
            const blob = new Blob([updatedTechnicalJS], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'technical.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Technical work published! Replace the technical.js file in your website folder.', 'success');
            
        } catch (error) {
            console.error('Error updating technical.js:', error);
            this.showToast('Work saved but technical.js update failed. Add manually if needed.', 'warning');
        }
    }
    
    // Generate updated technical.js with new work
    generateUpdatedTechnicalJS(newWork) {
        return `// Technical Work Display JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initializeTechnicalPage();
});

function initializeTechnicalPage() {
    loadTechnicalWorks();
    setupFiltering();
    addPageStyles();
}

function loadTechnicalWorks() {
    const technicalGrid = document.getElementById('technicalGrid');
    if (!technicalGrid) return;

    const savedWorks = getSavedTechnicalWorks();
    const staticWorks = getStaticTechnicalWorks();
    
    // Combine saved and static works
    const allWorks = [...savedWorks, ...staticWorks];
    
    // Sort by date (most recent first)
    const sortedWorks = sortWorksByDate(allWorks);
    
    // Clear grid and rebuild
    technicalGrid.innerHTML = '';
    
    sortedWorks.forEach(work => {
        const workCard = work.isStatic ? 
            createStaticWorkCard(work) : 
            createSavedWorkCard(work);
        technicalGrid.appendChild(workCard);
    });
}

function getSavedTechnicalWorks() {
    const works = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('technical_work_')) {
            try {
                const work = JSON.parse(localStorage.getItem(key));
                if (work.status === 'published') {
                    work.isStatic = false;
                    works.push(work);
                }
            } catch (e) {
                console.error('Error parsing saved work:', e);
            }
        }
    }
    return works;
}

function getStaticTechnicalWorks() {
    // Static works from the original HTML plus new work
    return [
${this.generateAllStaticWorks(newWork)}
    ];
}

// Rest of the technical.js functions remain the same
function sortWorksByDate(works) {
    return works.sort((a, b) => {
        const dateA = parseWorkDate(a.date);
        const dateB = parseWorkDate(b.date);
        return dateB - dateA; // Most recent first
    });
}

function parseWorkDate(dateStr) {
    if (!dateStr) return new Date(0);
    
    // Handle "Month Year" format
    if (dateStr.match(/^[A-Za-z]+ \\d{4}$/)) {
        return new Date(dateStr + ' 1');
    }
    
    // Try standard date parsing
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function createStaticWorkCard(work) {
    const card = document.createElement('article');
    card.className = 'technical-card';
    card.setAttribute('data-category', work.type);
    
    const instructorInfo = work.instructor ? 
        \` • <i class="fas fa-chalkboard-teacher"></i> \${work.instructor}\` : '';
    
    card.innerHTML = \`
        <div class="card-meta">
            <span class="date">\${work.date}</span>
            <span class="category">\${getCategoryDisplay(work.type)}</span>
            <span class="institution">\${work.venue}</span>
        </div>
        <h3 class="card-title">
            <a href="\${work.pdfPath}">\${work.title}</a>
        </h3>
        <p class="card-authors">
            <i class="fas fa-user"></i> \${work.authors}\${instructorInfo}
        </p>
        <p class="card-abstract">
            \${work.abstract}
        </p>
        <div class="card-tags">
            \${work.tags.map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
        </div>
        <div class="card-actions">
            <a href="\${work.pdfPath}" class="action-btn primary">
                <i class="fas fa-file-pdf"></i> View PDF
            </a>
            \${work.downloadPdf ? \`<a href="\${work.downloadPdf}" download class="action-btn secondary">
                <i class="fas fa-download"></i> Download PDF
            </a>\` : ''}
            \${work.texPath ? \`<a href="\${work.texPath}" download class="action-btn secondary">
                <i class="fas fa-code"></i> LaTeX Source
            </a>\` : ''}
        </div>
    \`;
    
    return card;
}

function createSavedWorkCard(work) {
    return createStaticWorkCard(work);
}

function getCategoryDisplay(type) {
    const categoryMap = {
        'notes': 'Class Notes',
        'papers': 'Research Paper',
        'preprints': 'Preprint',
        'presentations': 'Presentation'
    };
    return categoryMap[type] || type;
}

function setupFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const technicalCards = document.querySelectorAll('.technical-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            technicalCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function addPageStyles() {
    // Additional page-specific styles if needed
}`;
    }
    
    // Generate all static works including existing ones plus new work
    generateAllStaticWorks(newWork) {
        const existingWorks = [
            {
                title: "Additive Combinatorics Notes",
                type: "notes",
                date: "January 2024",
                authors: "Leart Ajvazaj",
                instructor: "Julia Wolf",
                venue: "University of Cambridge",
                abstract: "Comprehensive notes from an Additive Combinatorics class at Cambridge. Covers Fourier-analytic techniques, Bogolyubov's lemma, Roth's theorem, and modern developments in arithmetic progressions and sum-product phenomena.",
                tags: ["Additive Combinatorics", "Fourier Analysis", "Number Theory"],
                pdfPath: "additive_combo.html",
                downloadPdf: "papers/additive_combinatorics.pdf",
                texPath: "papers/additive_combinatorics.tex",
                isStatic: true
            },
            {
                title: "Computational Complexity",
                type: "notes",
                date: "January 2024",
                authors: "Leart Ajvazaj",
                instructor: "",
                venue: "University of Cambridge",
                abstract: "An introduction to complexity theory including topics on basic complexity classes, completeness, and randomized algorithms.",
                tags: ["Complexity Theory", "Algorithms", "Computer Science"],
                pdfPath: "computational_complexity.html",
                downloadPdf: "papers/computational_complexity.pdf",
                texPath: "papers/computational_complexity.tex",
                isStatic: true
            },
            {
                title: "Galois Theory Notes",
                type: "notes",
                date: "January 2021",
                authors: "Leart Ajvazaj",
                instructor: "Miki Havlickova",
                venue: "Yale University",
                abstract: "Notes from a Fields and Galois Theory class at Yale. Covers field extensions, construction problems, problems of solvability, cyclotomic extensions, etc.",
                tags: ["Galois Theory", "Algebra", "Number Theory"],
                pdfPath: "galois_theory_notes.html",
                downloadPdf: "papers/Galois_theory_notes.pdf",
                texPath: "papers/Galois_theory_notes.tex",
                isStatic: true
            }
        ];
        
        // Add new work to the beginning (most recent first)
        const allWorks = [newWork, ...existingWorks];
        
        // Sort by date
        allWorks.sort((a, b) => {
            const dateA = new Date(a.date + ' 1');
            const dateB = new Date(b.date + ' 1');
            return dateB - dateA;
        });
        
        // Generate JavaScript object strings
        return allWorks.map(work => {
            const instructorLine = work.instructor ? `"${work.instructor}"` : '""';
            const tagsArray = work.tags.map(tag => `"${tag}"`).join(', ');
            
            return `        {
            title: "${work.title}",
            type: "${work.type}",
            date: "${work.date}",
            authors: "${work.authors}",
            instructor: ${instructorLine},
            venue: "${work.venue}",
            abstract: "${work.abstract}",
            tags: [${tagsArray}],
            pdfPath: "${work.pdfPath}",
            downloadPdf: "${work.downloadPdf}",
            texPath: "${work.texPath}",
            isStatic: true
        }`;
        }).join(',\\n');
    }
}

// Global functions for HTML onclick handlers
function addNewWork() {
    window.manager.showForm();
}

function closeForm() {
    window.manager.closeForm();
}

function saveWork() {
    window.manager.saveWork();
}

function previewWork() {
    window.manager.updatePreview();
    document.getElementById('workPreview').scrollIntoView({ behavior: 'smooth' });
}

function saveDraft() {
    // Implementation for saving draft
    window.manager.showToast('Draft saved!');
}

function closeDeleteModal() {
    window.manager.closeDeleteModal();
}

function confirmDelete() {
    window.manager.confirmDelete();
}

// Initialize manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.manager = new TechnicalWorkManager();
});

// Add styles for the technical manager
const technicalManagerStyles = document.createElement('style');
technicalManagerStyles.textContent = `
    .technical-manager-main {
        padding-top: 70px;
        min-height: 100vh;
        background: var(--bg-primary, #f8f9fa);
    }

    .technical-manager-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .technical-manager-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 2rem;
    }

    .header-content p {
        margin: 0;
        color: #666;
        font-size: 1.1rem;
    }

    .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .btn-primary, .btn-secondary, .btn-outline, .btn-danger {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }

    .btn-primary {
        background: #667eea;
        color: white;
    }

    .btn-primary:hover {
        background: #5a67d8;
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .btn-secondary:hover {
        background: #5a6268;
    }

    .btn-outline {
        background: transparent;
        color: #667eea;
        border: 2px solid #667eea;
    }

    .btn-outline:hover {
        background: #667eea;
        color: white;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }

    .btn-danger:hover {
        background: #c82333;
    }

    .add-edit-form {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        overflow: hidden;
    }

    .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
    }

    .form-header h2 {
        margin: 0;
        color: #333;
    }

    .close-form {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
    }

    .close-form:hover {
        background: #e9ecef;
    }

    .form-content {
        padding: 2rem;
    }

    .form-section {
        margin-bottom: 2rem;
    }

    .form-section h3 {
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.3rem;
        border-bottom: 2px solid #667eea;
        padding-bottom: 0.5rem;
    }

    .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .form-group {
        flex: 1;
    }

    .form-group.full-width {
        flex: 100%;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
    }

    .form-input, .form-select, .form-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.invalid, .form-select.invalid, .form-textarea.invalid {
        border-color: #dc3545;
    }

    .file-upload-section {
        margin-bottom: 1.5rem;
    }

    .file-upload-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
    }

    .file-upload-area {
        border: 2px dashed #e9ecef;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #f8f9fa;
    }

    .file-upload-area:hover, .file-upload-area.dragover {
        border-color: #667eea;
        background: #f0f4ff;
    }

    .upload-content i {
        font-size: 2rem;
        color: #667eea;
        margin-bottom: 1rem;
    }

    .upload-content p {
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        color: #333;
    }

    .upload-content small {
        color: #666;
    }

    .file-info {
        margin-top: 0.5rem;
    }

    .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #e8f5e8;
        border: 1px solid #d4edda;
        border-radius: 6px;
    }

    .file-details {
        display: flex;
        flex-direction: column;
    }

    .file-name {
        font-weight: 500;
        color: #155724;
    }

    .file-size {
        font-size: 0.85rem;
        color: #666;
    }

    .remove-file {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        cursor: pointer;
    }

    .work-preview {
        border: 2px solid #e9ecef;
        border-radius: 8px;
        padding: 1rem;
        background: #f8f9fa;
    }

    .preview-placeholder {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
    }

    .technical-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
    }

    .preview-card {
        margin: 0;
    }

    .card-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .card-meta span {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .date {
        background: #e9ecef;
        color: #666;
    }

    .category {
        background: #667eea;
        color: white;
    }

    .venue {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #e9ecef;
    }

    .card-title {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.3rem;
    }

    .card-authors {
        color: #666;
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
    }

    .card-abstract {
        color: #444;
        line-height: 1.6;
        margin: 0 0 1rem 0;
    }

    .card-tags {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .tag {
        background: #f0f4ff;
        color: #667eea;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
        border: 1px solid #e0e8ff;
    }

    .card-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .action-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.85rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .action-btn.primary {
        background: #667eea;
        color: white;
    }

    .action-btn.secondary {
        background: #6c757d;
        color: white;
    }

    .form-footer {
        padding: 1.5rem 2rem;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .existing-works {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }

    .existing-works h2 {
        margin: 0 0 1.5rem 0;
        color: #333;
    }

    .works-filter {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 0.5rem 1rem;
        border: 2px solid #e9ecef;
        background: white;
        color: #666;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .filter-btn:hover {
        border-color: #667eea;
        color: #667eea;
    }

    .filter-btn.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
    }

    .works-list {
        display: grid;
        gap: 1rem;
    }

    .work-card {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }

    .work-card:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    .work-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .work-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .work-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn-small {
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
        background: #6c757d;
        color: white;
    }

    .action-btn-small:hover {
        transform: translateY(-1px);
    }

    .action-btn-small.danger {
        background: #dc3545;
    }

    .work-title {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.2rem;
    }

    .work-authors {
        color: #666;
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
    }

    .work-abstract {
        color: #444;
        line-height: 1.6;
        margin: 0 0 1rem 0;
    }

    .work-files {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .file-indicator {
        background: #f0f4ff;
        color: #667eea;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
        border: 1px solid #e0e8ff;
    }

    .work-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #666;
    }

    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;
        text-transform: capitalize;
    }

    .status-badge.published {
        background: #d4edda;
        color: #155724;
    }

    .status-badge.draft {
        background: #fff3cd;
        color: #856404;
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #666;
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ccc;
    }

    .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }

    .toast {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1001;
        font-weight: 500;
    }

    .toast.show {
        transform: translateX(0);
    }

    .success-toast {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
    }

    .error-toast {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
    }

    .delete-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .delete-content {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .delete-header {
        text-align: center;
        padding: 2rem 2rem 1rem;
        background: #fff5f5;
        border-bottom: 1px solid #fed7d7;
    }

    .delete-icon {
        width: 60px;
        height: 60px;
        background: #feb2b2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
    }

    .delete-icon i {
        font-size: 1.5rem;
        color: #c53030;
    }

    .delete-header h3 {
        margin: 0;
        font-size: 1.4rem;
        color: #1a202c;
    }

    .delete-body {
        padding: 2rem;
        text-align: center;
    }

    .delete-body p {
        margin: 0 0 1rem 0;
        color: #4a5568;
        font-size: 1.1rem;
    }

    .work-info {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        text-align: left;
    }

    .warning-text {
        background: #fef5e7;
        border: 1px solid #f6e05e;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        color: #975a16;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .delete-footer {
        padding: 1rem 2rem 2rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    /* Dark theme styles */
    .dark-theme .technical-manager-main {
        background: #1a1a1a;
    }

    .dark-theme .technical-manager-header,
    .dark-theme .add-edit-form,
    .dark-theme .existing-works,
    .dark-theme .technical-card,
    .dark-theme .work-card {
        background: #2d2d2d;
        color: #e0e0e0;
        border-color: #404040;
    }

    .dark-theme .form-header {
        background: #333;
        border-bottom-color: #555;
    }

    .dark-theme .form-input,
    .dark-theme .form-select,
    .dark-theme .form-textarea {
        background: #333;
        color: #e0e0e0;
        border-color: #555;
    }

    .dark-theme .form-input:focus,
    .dark-theme .form-select:focus,
    .dark-theme .form-textarea:focus {
        border-color: #667eea;
    }

    .dark-theme .file-upload-area {
        background: #333;
        border-color: #555;
        color: #e0e0e0;
    }

    .dark-theme .file-upload-area:hover,
    .dark-theme .file-upload-area.dragover {
        background: #404040;
        border-color: #667eea;
    }

    .dark-theme .work-preview {
        background: #333;
        border-color: #555;
    }

    .dark-theme .form-footer {
        background: #333;
        border-top-color: #555;
    }

    .dark-theme .filter-btn {
        background: #333;
        border-color: #555;
        color: #e0e0e0;
    }

    .dark-theme .filter-btn:hover {
        border-color: #667eea;
        color: #667eea;
    }

    .dark-theme .filter-btn.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
    }

    .dark-theme .delete-content {
        background: #2d2d2d;
        color: #e0e0e0;
    }

    .dark-theme .delete-header {
        background: #4a2c2c;
        border-bottom-color: #6b3636;
    }

    .dark-theme .work-info {
        background: #333;
        border-color: #555;
    }

    .dark-theme .warning-text {
        background: #4a3a1a;
        border-color: #6b5b2a;
        color: #d4af37;
    }

    @media (max-width: 768px) {
        .technical-manager-container {
            padding: 1rem;
        }

        .technical-manager-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .header-actions {
            flex-direction: column;
            width: 100%;
        }

        .form-row {
            flex-direction: column;
        }

        .works-filter {
            justify-content: center;
        }

        .work-header {
            flex-direction: column;
            gap: 1rem;
        }

        .work-meta {
            justify-content: center;
        }

        .work-actions {
            align-self: center;
        }

        .delete-body {
            padding: 1rem;
        }

        .delete-footer {
            flex-direction: column;
            gap: 0.5rem;
        }
    }

    /* Preview page notification styles */
    .preview-page-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: var(--card-bg, white);
        border: 1px solid var(--border-color, #e9ecef);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification-content {
        padding: 1.5rem;
    }

    .notification-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .notification-header i {
        color: #28a745;
        font-size: 1.25rem;
    }

    .notification-header h4 {
        margin: 0;
        color: var(--text-primary, #333);
        font-size: 1.125rem;
        font-weight: 600;
    }

    .notification-content p {
        margin: 0 0 1rem 0;
        color: var(--text-light, #666);
        line-height: 1.4;
    }

    .notification-actions {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .notification-actions .btn-primary,
    .notification-actions .btn-secondary {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        border-radius: 6px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .notification-instructions {
        background: var(--bg-secondary, #f8f9fa);
        padding: 0.75rem;
        border-radius: 6px;
        border-left: 3px solid #17a2b8;
    }

    .notification-instructions small {
        color: var(--text-light, #666);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        line-height: 1.3;
    }

    .notification-instructions i {
        color: #17a2b8;
    }

    .dark-theme .preview-page-notification {
        background: #2d2d2d;
        border-color: #404040;
    }

    .dark-theme .notification-header h4 {
        color: #e0e0e0;
    }

    .dark-theme .notification-content p {
        color: #ccc;
    }

    .dark-theme .notification-instructions {
        background: #1a1a1a;
    }

    .dark-theme .notification-instructions small {
        color: #ccc;
    }

    @media (max-width: 768px) {
        .preview-page-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }

        .notification-actions {
            flex-direction: column;
        }

        .notification-actions .btn-primary,
        .notification-actions .btn-secondary {
            justify-content: center;
        }
    }
`;
document.head.appendChild(technicalManagerStyles);