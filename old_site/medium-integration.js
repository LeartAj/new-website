// Medium Integration Script
class MediumIntegration {
    constructor() {
        this.mediumUsername = 'ajvazajleart'; // Your actual Medium username
        this.cacheDuration = 1000 * 60 * 60; // 1 hour cache
        this.mediumArticles = [];
        this.init();
    }

    init() {
        this.loadMediumScript();
        this.fetchMediumArticles();
    }

    // Load Medium's embed script
    loadMediumScript() {
        if (!document.querySelector('script[src*="medium.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://medium.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    // Fetch articles from Medium RSS feed
    async fetchMediumArticles() {
        try {
            // Use RSS2JSON service to convert Medium RSS to JSON
            const rssUrl = `https://medium.com/feed/@${this.mediumUsername}`;
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}&api_key=YOUR_API_KEY&count=10`);
            const data = await response.json();

            if (data.status === 'ok') {
                this.mediumArticles = data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: new Date(item.pubDate),
                    description: this.extractDescription(item.description),
                    fullContent: this.extractContent(item.description),
                    thumbnail: this.extractThumbnail(item.description),
                    readTime: this.estimateReadTime(item.description),
                    categories: item.categories || [],
                    author: item.author || 'Leart Ajvazi'
                }));

                this.renderMediumArticles();
            }
        } catch (error) {
            console.error('Error fetching Medium articles:', error);
        }
    }

    // Extract description from HTML content
    extractDescription(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.substring(0, 200) + '...';
    }

    // Extract more substantial content for preview
    extractContent(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove script tags and other non-content elements
        const scripts = div.querySelectorAll('script, style, noscript');
        scripts.forEach(script => script.remove());
        
        // Get text content
        const text = div.textContent || div.innerText || '';
        
        // Split into paragraphs and take first few
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
        const previewParagraphs = paragraphs.slice(0, 4); // First 4 paragraphs
        
        return previewParagraphs.join('\n\n').substring(0, 800) + '...';
    }

    // Extract thumbnail from HTML content
    extractThumbnail(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const img = div.querySelector('img');
        return img ? img.src : null;
    }

    // Estimate reading time
    estimateReadTime(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200); // Average reading speed
        return `${minutes} min read`;
    }

    // Render Medium articles in your existing grid
    renderMediumArticles() {
        const container = document.querySelector('.writings-grid');
        if (!container) return;

        this.mediumArticles.forEach(article => {
            const articleCard = this.createMediumCard(article);
            container.appendChild(articleCard);
        });
    }

    // Create a Medium article card
    createMediumCard(article) {
        const card = document.createElement('article');
        card.className = 'writing-card medium-article';
        card.setAttribute('data-category', 'medium');

        card.innerHTML = `
            <div class="card-meta">
                <span class="date">${this.formatDate(article.pubDate)}</span>
                <span class="category">Medium</span>
                <span class="read-time">${article.readTime}</span>
                <span class="platform-badge">
                    <i class="fab fa-medium"></i>
                </span>
            </div>
            <h3 class="card-title">
                <a href="${article.link}" target="_blank" rel="noopener">${article.title}</a>
            </h3>
            <p class="card-excerpt">${article.description}</p>
            <div class="card-actions">
                <a href="${article.link}" target="_blank" class="read-more">
                    Read on Medium <i class="fas fa-external-link-alt"></i>
                </a>
                <button class="embed-btn" onclick="mediumIntegration.createEnhancedPreview('${encodeURIComponent(JSON.stringify({
                    title: article.title,
                    link: article.link,
                    content: article.fullContent,
                    thumbnail: article.thumbnail,
                    author: article.author,
                    pubDate: article.pubDate,
                    readTime: article.readTime
                }))}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
            </div>
        `;

        return card;
    }

    // Format date for display
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Create enhanced preview modal with substantial content
    createEnhancedPreview(encodedArticleData) {
        const article = JSON.parse(decodeURIComponent(encodedArticleData));
        
        const modal = document.createElement('div');
        modal.className = 'medium-modal enhanced-preview';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="article-meta">
                        <div class="platform-info">
                            <i class="fab fa-medium"></i>
                            <span>Medium Article Preview</span>
                        </div>
                        <div class="read-info">
                            <span class="read-time">${article.readTime}</span>
                            <span class="pub-date">${this.formatDate(new Date(article.pubDate))}</span>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.medium-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="article-preview-content">
                        ${article.thumbnail ? `<div class="preview-image">
                            <img src="${article.thumbnail}" alt="${article.title}" loading="lazy">
                        </div>` : ''}
                        <div class="preview-header">
                            <h2 class="preview-title">${article.title}</h2>
                            <div class="author-info">
                                <span class="author">by ${article.author}</span>
                            </div>
                        </div>
                        <div class="preview-content">
                            ${this.formatPreviewContent(article.content)}
                        </div>
                        <div class="preview-footer">
                            <div class="continue-reading">
                                <p><strong>This is a preview.</strong> Continue reading the full article on Medium for the complete experience, comments, and interactive features.</p>
                            </div>
                            <div class="article-url">
                                <i class="fas fa-link"></i>
                                <span class="url-text">${article.link}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.medium-modal').remove()">
                        <i class="fas fa-times"></i>
                        Close Preview
                    </button>
                    <a href="${article.link}" target="_blank" class="btn btn-primary">
                        <i class="fab fa-medium"></i>
                        Continue Reading on Medium
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.querySelector('.medium-modal')) {
                modal.remove();
            }
        });

        // Auto-focus the primary button
        setTimeout(() => {
            const primaryBtn = modal.querySelector('.btn-primary');
            if (primaryBtn) primaryBtn.focus();
        }, 100);
    }

    // Format preview content with better paragraph breaks
    formatPreviewContent(content) {
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    }

    // Create preview for static Medium article
    createStaticPreview() {
        const staticArticle = {
            title: 'Ura e pamundur',
            link: 'https://medium.com/@ajvazajleart/ura-e-pamundur-e5186cae25e5',
            content: 'Një reflektim mbi sfidat dhe mundësitë e ndërtimit të urave të reja në shoqërinë tonë.\n\nNë një kohë kur duket se të gjitha urat janë djegur, a është e mundur të ndërtojmë të reja? Kjo është një pyetje që më ka shoqëruar kohët e fundit, sidomos kur shikoj gjendjen e tanishme të dialogut politik dhe shoqëror në vendin tonë.\n\nUrat nuk janë vetëm struktura fizike - ato janë simbole të lidhjes, të komunikimit, të mundësive për të kaluar nga një anë tek tjetra. Në politikë, në shoqëri, në marrëdhëniet njerëzore, ne kemi nevojë për ura.\n\nPor çfarë ndodh kur këto ura digjen? Çfarë ndodh kur dialogu ndalon, kur palët nuk dëgjojnë më njëra-tjetrën, kur çdo tentativë për komunikim shihet me dyshim?',
            thumbnail: null,
            author: 'Leart Ajvazi',
            pubDate: '2024-06-15',
            readTime: '3 min read'
        };

        this.createEnhancedPreview(encodeURIComponent(JSON.stringify(staticArticle)));
    }

    // Create embedded article view (alternative to modal)
    createInlineEmbed(articleUrl, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const embedDiv = document.createElement('div');
        embedDiv.innerHTML = `<a href="${articleUrl}">${articleUrl}</a>`;
        container.appendChild(embedDiv);

        // Medium's embed.js will automatically convert the link to an embed
        if (window.medium && window.medium.embedsLoaded) {
            window.medium.embedsLoaded();
        }
    }
}

// Initialize Medium integration
const mediumIntegration = new MediumIntegration(); 