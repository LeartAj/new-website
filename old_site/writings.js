// Filter functionality for writings page
document.addEventListener('DOMContentLoaded', () => {
    let filterButtons = [];
    let writingCards = [];

    // Initialize everything after DOM is loaded
    init();

    function init() {
        // Load published articles from writer interface first
        loadPublishedArticles();
        
        // Then set up filtering
        setupFiltering();
        
        // Finally add search functionality
        setupSearch();
        
        // Update admin controls if admin is authenticated
        if (window.adminAuth && window.adminAuth.isAdmin()) {
            setTimeout(() => {
                window.adminAuth.updateWritingsPageControls();
            }, 100);
        }
    }

    // Function to load published articles from localStorage
    function loadPublishedArticles() {
        const writingsGrid = document.querySelector('.writings-grid');
        if (!writingsGrid) return;

        const publishedArticles = getPublishedArticles();
        const staticArticles = getWritingsStaticArticles();
        
        // Combine published and static articles
        const allArticles = [...publishedArticles, ...staticArticles];
        
        // Sort all articles by their display date
        const sortedArticles = sortWritingsArticlesByDisplayDate(allArticles);
        
        // Clear the grid and rebuild it with sorted articles
        writingsGrid.innerHTML = '';
        
        sortedArticles.forEach(article => {
            const articleCard = article.isStatic ? 
                createWritingsStaticArticleCard(article) : 
                createArticleCard(article);
            writingsGrid.appendChild(articleCard);
        });
    }
    
    // Get all published articles from localStorage
    function getPublishedArticles() {
        const articles = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('article_')) {
                try {
                    const article = JSON.parse(localStorage.getItem(key));
                    if (article.status === 'published') {
                        // Add display date for consistent sorting
                        article.displayDate = getWritingsDisplayDate(article);
                        articles.push(article);
                    }
                } catch (e) {
                    console.error('Error parsing saved article:', e);
                }
            }
        }
        // Sort by display date (most recent first)
        return articles.sort((a, b) => {
            const dateA = parseWritingsDateString(a.displayDate);
            const dateB = parseWritingsDateString(b.displayDate);
            return dateB - dateA;
        });
    }
    
    // Helper functions for date handling
    function getWritingsDisplayDate(article) {
        // For published articles, use custom date if available, otherwise format publishDate
        if (article.customDate) {
            return new Date(article.customDate + 'T12:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (article.publishDate) {
            return new Date(article.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function parseWritingsDateString(dateStr) {
        // Handle different date formats
        if (!dateStr) return new Date(0);
        
        // Try parsing "Month Day, Year" format
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
        
        // Handle "Month Year" format (no specific day)
        if (dateStr.match(/^[A-Za-z]+ \d{4}$/)) {
            return new Date(dateStr + ' 1'); // Default to 1st of the month
        }
        
        return new Date(0); // Default to epoch if can't parse
    }

    function getWritingsStaticArticles() {
        // Static articles from the writings page HTML
        return [
            {
                title: "Heronjtë i bën qëllimi",
                displayDate: "June 15, 2025",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Rastësisht pashë disa klipe nga debati në Pressing, ku flitej për \"armëzimin\" e viktimësisë nga Saranda Bogujevci për të mbrojtur shefin e saj. U intrigova mjaftueshëm për ta parë episodin e plotë.",
                href: "heronjt-i-bn-qllimi.html",
                isStatic: true
            },
            {
                title: "Nuk ka fitues. Ka veç numra",
                displayDate: "February 24, 2025",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Kur ende presim për rezultatet përfundimtare të zgjedhjeve të 9 shkurtit, këmbësoria e vetëvendosjes ka filluar betejën e saj të radhës lidhur me legjitimitetin e një qeverie pa vetëvendosjen.",
                href: "nuk-ka-fitues-ka-ve-numra.html",
                isStatic: true
            },
            {
                title: "Dështimi nuk shpërblehet",
                displayDate: "February 8, 2025",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Partia personale e Albin Kurtit qeverisi për katër vite me 58 deputetë dhe me të gjitha postet e rëndësishme shtetërore. A i dha kjo parti mjaftueshëm Kosovës për të mos u skuqur kur kërkon 500 mijë vota?",
                href: "dshtimi-nuk-shprblehet.html",
                isStatic: true
            },
            {
                title: "Problemi im me Programin e LDK-së për Teknologji",
                displayDate: "December 13, 2024",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Po bëhet thuajse një vit nga publikimi i programit qeverisës të Lidhjes Demokratike të Kosovës i titulluar \"Rruga e Re\". Publikimi i programit qeverisës është hap shumë i mirë.",
                href: "problemi-im-me-programin-e-ldk-s-pr-teknologji.html",
                isStatic: true
            },
            {
                title: "Ura e Pamundur",
                displayDate: "July 12, 2024",
                category: "personal",
                categoryDisplay: "Personal",
                excerpt: "Në zemër të Ballkanit, ku historia pëshpëritë përmes maleve të lashtë dhe lumenjve të thyer kishte rënë një mort i zi. Brenda kësaj toke të gjallë, të vendosur ndërmjet kodrave dhe luginave.",
                href: "ura-e-pamundur.html",
                isStatic: true
            },
            {
                title: "Understanding Neural Network Optimization: A Geometric Perspective",
                displayDate: "March 15, 2024",
                category: "machine-learning",
                categoryDisplay: "Machine Learning",
                excerpt: "An exploration of the geometry of neural network loss landscapes and how it influences training dynamics. Discover why certain optimization techniques work better than others through the lens of geometric analysis.",
                href: "article.html",
                isStatic: true
            },
            {
                title: "Ata që vallëzojnë mbi varre",
                displayDate: "January 22, 2024",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Kur lexova për vrasjen e një tetëmbëdhjetëvjeçari në Podujevë, mbylla sytë. Kështu bëj zakonisht me lajme të tilla. E di se me të mësuar detajet, dhimbja për jetën e humbur dhe ato të shkatërruara si pasojë, veç sa mund të rritet.",
                href: "ata-q-vallzojn-mbi-varre.html",
                isStatic: true
            },
            {
                title: "I korruptuar ideologjikisht",
                displayDate: "June 4, 2022",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "Ka kohë që në kritikat për politikanët kosovarë përmenden shtëpitë në lagje private, veturat luksoze ose reflektime të tjera të kapitalit të tyre ekonomik. Dekonstruktimi ideologjik i mënyrës se si jetojnë politikanë të caktuar është larg më i rëndësishëm.",
                href: "i-korruptuar-ideologjikisht.html",
                isStatic: true
            },
            {
                title: "Mos e lexo këtë shkrim—Është për politikë",
                displayDate: "April 4, 2022",
                category: "politics",
                categoryDisplay: "Politics",
                excerpt: "",
                href: "mos-e-lexo-kete-shkrim.html",
                isStatic: true
            }
        ];
    }

    function sortWritingsArticlesByDisplayDate(articles) {
        return articles.sort((a, b) => {
            const dateA = parseWritingsDateString(a.displayDate);
            const dateB = parseWritingsDateString(b.displayDate);
            return dateB - dateA; // Most recent first
        });
    }

    function createWritingsStaticArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'writing-card static-article';
        card.setAttribute('data-category', article.category || 'personal');
        
        card.innerHTML = `
            <div class="card-meta">
                <span class="date">${article.displayDate}</span>
                <span class="category">${article.categoryDisplay}</span>
            </div>
            <h3 class="card-title">
                <a href="${article.href}">${article.title}</a>
            </h3>
            <p class="card-excerpt">
                ${article.excerpt}
            </p>
            <a href="${article.href}" class="read-more">Read More${article.href === '#' ? ' <i class="fas fa-arrow-right"></i>' : ''}</a>
        `;
        
        return card;
    }
    
    // Create article card HTML
    function createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'writing-card published-article';
        card.setAttribute('data-category', article.category || 'personal');
        
        card.innerHTML = `
            <div class="card-meta">
                <span class="date">${article.displayDate}</span>
                <span class="category">${getCategoryDisplayName(article.category)}</span>
                ${article.tags && article.tags.length > 0 ? `<span class="tags">${article.tags.slice(0, 2).join(', ')}</span>` : ''}
            </div>
            <h3 class="card-title">
                ${article.htmlFilename ? 
                    `<a href="${article.htmlFilename}">${article.title}</a>` :
                    `<a href="#" onclick="openPublishedArticle('${article.id}')">${article.title}</a>`}
            </h3>
            <p class="card-excerpt">
                ${article.excerpt || extractExcerpt(article.content)}
            </p>
            <div class="card-actions">
                ${article.htmlFilename ? 
                    `<a href="${article.htmlFilename}" class="read-more">Read Article</a>` :
                    `<a href="#" onclick="openPublishedArticle('${article.id}')" class="read-more">Read Article</a>`}
            </div>
        `;
        
        return card;
    }
    
    // Get display name for category
    function getCategoryDisplayName(category) {
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
    
    // Extract excerpt from HTML content
    function extractExcerpt(htmlContent) {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        const text = div.textContent || div.innerText || '';
        return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    }
    
    // Set up filtering functionality
    function setupFiltering() {
        // Get all elements
        filterButtons = document.querySelectorAll('.filter-btn');
        writingCards = document.querySelectorAll('.writing-card');
        
        console.log('Setting up filters:', filterButtons.length, 'buttons,', writingCards.length, 'cards');
        
        if (filterButtons.length === 0 || writingCards.length === 0) {
            console.log('No filter buttons or writing cards found');
            return;
        }
        
        // Add event listeners to filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const filterValue = this.getAttribute('data-filter');
                console.log('Filter button clicked:', filterValue);
                
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                // Filter the cards
                writingCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                        
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        // Show card
                        card.style.display = 'block';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                    } else {
                        // Hide card
                            card.style.display = 'none';
                    }
                });
                
                console.log('Filtered to:', filterValue, '- Visible cards:', 
                    Array.from(writingCards).filter(card => card.style.display !== 'none').length);
            });
        });
    }
    
    // Set up search functionality
    function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search writings...';
    searchInput.className = 'search-input';
    
    const filterContainer = document.querySelector('.filter-buttons');
        if (filterContainer) {
    filterContainer.parentNode.insertBefore(searchInput, filterContainer);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
                
                // Refresh writingCards in case new articles were added
                writingCards = document.querySelectorAll('.writing-card');
        
        writingCards.forEach(card => {
                    const title = card.querySelector('.card-title a')?.textContent.toLowerCase() || '';
                    const excerpt = card.querySelector('.card-excerpt')?.textContent.toLowerCase() || '';
                    const category = card.querySelector('.category')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
        }
    }
});

// Global functions for article interactions
function openPublishedArticle(articleId) {
    const article = JSON.parse(localStorage.getItem(`article_${articleId}`));
    if (article) {
        // Create a modal to display the full article
        showArticleModal(article);
    }
}

function editPublishedArticle(articleId) {
    // Redirect to write page with article ID to edit
    window.location.href = `write.html?edit=${articleId}`;
}

function deletePublishedArticle(articleId) {
    const article = JSON.parse(localStorage.getItem(`article_${articleId}`));
    if (article) {
        showDeleteConfirmation(article);
    }
}

function showDeleteConfirmation(article) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'delete-modal';
    modal.innerHTML = `
        <div class="delete-modal-content">
            <div class="delete-modal-header">
                <div class="delete-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Delete Article</h3>
            </div>
            <div class="delete-modal-body">
                <p>Are you sure you want to delete this article?</p>
                <div class="article-info">
                    <strong>"${article.title}"</strong>
                    <br>
                    <small>Published on ${new Date(article.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</small>
                </div>
                <div class="warning-text">
                    <i class="fas fa-info-circle"></i>
                    This action cannot be undone. The article will be permanently deleted.
                </div>
            </div>
            <div class="delete-modal-footer">
                <button class="btn btn-secondary" onclick="closeDeleteModal()">
                    Cancel
                </button>
                <button class="btn btn-danger" onclick="confirmDeleteArticle('${article.id}')">
                    <i class="fas fa-trash"></i>
                    Delete Article
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', handleDeleteEscapeKey);
}

function closeDeleteModal() {
    const modal = document.querySelector('.delete-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleDeleteEscapeKey);
}

function handleDeleteEscapeKey(e) {
    if (e.key === 'Escape') {
        closeDeleteModal();
    }
}

function confirmDeleteArticle(articleId) {
    // Remove from localStorage
    localStorage.removeItem(`article_${articleId}`);
    
    // Remove from UI
    const articleCard = document.querySelector(`[onclick*="${articleId}"]`).closest('.writing-card');
    if (articleCard) {
        // Animate removal
        articleCard.style.transition = 'all 0.3s ease';
        articleCard.style.opacity = '0';
        articleCard.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            articleCard.remove();
            showDeleteToast('Article deleted successfully');
        }, 300);
    }
    
    closeDeleteModal();
}

function showDeleteToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'delete-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showArticleModal(article) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="article-modal-content">
            <div class="article-modal-header">
                <h2>${article.title}</h2>
                <button class="close-article-modal" onclick="closeArticleModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="article-modal-body">
                <div class="article-meta-full">
                    <span class="publish-date">${new Date(article.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    ${article.category ? `<span class="category-badge">${getCategoryDisplayName(article.category)}</span>` : ''}
                    ${article.tags && article.tags.length > 0 ? `<div class="tags-list">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
                <div class="article-content-full">
                    ${typeof article.content === 'string' ? article.content : ''}
                </div>
            </div>
            <div class="article-modal-footer">
                <button class="btn btn-secondary" onclick="closeArticleModal()">Close</button>
                <div class="admin-only" style="display: none;">
                    <button class="btn btn-primary" onclick="editPublishedArticle('${article.id}')">
                        <i class="fas fa-edit"></i> Edit Article
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeArticleModal();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', handleEscapeKey);
}

function closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeArticleModal();
    }
}

// Add styles for the new elements
const writingsStyles = document.createElement('style');
writingsStyles.textContent = `
    .page-header {
        text-align: center;
        margin-bottom: 4rem;
    }
    
    .page-title {
        font-size: 3rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .page-subtitle {
        font-size: 1.2rem;
        color: #666;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }
    
    .search-input {
        width: 100%;
        max-width: 400px;
        padding: 12px 20px;
        margin: 0 auto 2rem;
        display: block;
        border: 2px solid #e2e8f0;
        border-radius: 25px;
        font-size: 1rem;
        outline: none;
        transition: all 0.3s ease;
    }
    
    .search-input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .filter-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 3rem;
        flex-wrap: wrap;
    }
    
    .filter-btn {
        padding: 10px 20px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #666;
        border-radius: 25px;
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
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 4rem;
    }
    
    .page-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 10px 15px;
        border: 2px solid #e2e8f0;
        color: #666;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.3s ease;
    }
    
    .page-link:hover {
        border-color: #667eea;
        color: #667eea;
    }
    
    .page-link.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
    }
    
    .writing-card {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    /* Published article specific styles */
    .published-article {
        border-left: 4px solid #28a745;
        position: relative;
    }
    
    .tags {
        color: #667eea;
        font-size: 0.85em;
        font-weight: 500;
    }
    
    .card-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 1rem;
    }
    
    .edit-btn {
        background: transparent;
        border: 2px solid #ffc107;
        color: #ffc107;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.85em;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
         .edit-btn:hover {
         background: #ffc107;
         color: white;
     }
     
     .delete-btn {
         background: transparent;
         border: 2px solid #dc3545;
         color: #dc3545;
         padding: 6px 12px;
         border-radius: 6px;
         cursor: pointer;
         font-size: 0.85em;
         font-weight: 500;
         transition: all 0.3s ease;
         display: flex;
         align-items: center;
         gap: 4px;
     }
     
     .delete-btn:hover {
         background: #dc3545;
         color: white;
         transform: translateY(-1px);
     }
    
    /* Article modal styles */
    .article-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        backdrop-filter: blur(5px);
    }
    
    .article-modal-content {
        background: white;
        border-radius: 12px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
    }
    
    .article-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e9ecef;
        background: #f8f9fa;
    }
    
    .article-modal-header h2 {
        margin: 0;
        font-size: 1.5em;
        color: #333;
    }
    
    .close-article-modal {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    
    .close-article-modal:hover {
        background: #e9ecef;
    }
    
    .article-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }
    
    .article-meta-full {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f3f4;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
    }
    
    .publish-date {
        color: #666;
        font-size: 0.95em;
    }
    
    .category-badge {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 500;
    }
    
    .tags-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    
    .tag {
        background: #f8f9fa;
        color: #495057;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 0.8em;
        border: 1px solid #e9ecef;
    }
    
    .article-content-full {
        line-height: 1.7;
        font-size: 1.1em;
    }
    
    .article-content-full h1,
    .article-content-full h2,
    .article-content-full h3 {
        margin-top: 2em;
        margin-bottom: 1em;
    }
    
    .article-content-full p {
        margin-bottom: 1.5em;
    }
    
    .article-modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f8f9fa;
    }
    
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
    }
    
    .btn-primary {
        background: #667eea;
        color: white;
    }
    
    .btn-primary:hover {
        background: #5a6fd8;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
         .btn-secondary:hover {
         background: #5a6268;
     }
     
     .btn-danger {
         background: #dc3545;
         color: white;
     }
     
     .btn-danger:hover {
         background: #c82333;
     }
     
     /* Delete Modal Styles */
     .delete-modal {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         background: rgba(0, 0, 0, 0.8);
         display: flex;
         align-items: center;
         justify-content: center;
         z-index: 1000;
         padding: 20px;
         backdrop-filter: blur(5px);
     }
     
     .delete-modal-content {
         background: white;
         border-radius: 12px;
         max-width: 500px;
         width: 100%;
         overflow: hidden;
         box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
         animation: modalSlideIn 0.3s ease;
     }
     
     @keyframes modalSlideIn {
         from {
             opacity: 0;
             transform: translateY(-30px) scale(0.95);
         }
         to {
             opacity: 1;
             transform: translateY(0) scale(1);
         }
     }
     
     .delete-modal-header {
         text-align: center;
         padding: 24px 24px 16px;
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
         margin: 0 auto 16px;
     }
     
     .delete-icon i {
         font-size: 1.5em;
         color: #c53030;
     }
     
     .delete-modal-header h3 {
         margin: 0;
         font-size: 1.4em;
         color: #1a202c;
         font-weight: 600;
     }
     
     .delete-modal-body {
         padding: 24px;
         text-align: center;
     }
     
     .delete-modal-body p {
         margin: 0 0 20px 0;
         color: #4a5568;
         font-size: 1.1em;
     }
     
     .article-info {
         background: #f7fafc;
         border: 1px solid #e2e8f0;
         border-radius: 8px;
         padding: 16px;
         margin: 20px 0;
         text-align: left;
     }
     
     .article-info strong {
         color: #2d3748;
         font-size: 1.05em;
         display: block;
         margin-bottom: 4px;
     }
     
     .article-info small {
         color: #718096;
         font-size: 0.9em;
     }
     
     .warning-text {
         background: #fef5e7;
         border: 1px solid #f6e05e;
         border-radius: 6px;
         padding: 12px 16px;
         margin: 20px 0;
         color: #975a16;
         font-size: 0.9em;
         display: flex;
         align-items: center;
         gap: 8px;
     }
     
     .warning-text i {
         color: #d69e2e;
         flex-shrink: 0;
     }
     
     .delete-modal-footer {
         padding: 16px 24px 24px;
         display: flex;
         justify-content: flex-end;
         gap: 12px;
     }
     
     /* Delete Toast Styles */
     .delete-toast {
         position: fixed;
         top: 100px;
         right: 20px;
         background: #f0fff4;
         border: 1px solid #9ae6b4;
         border-left: 4px solid #38a169;
         color: #2f855a;
         padding: 16px 20px;
         border-radius: 8px;
         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
         display: flex;
         align-items: center;
         gap: 12px;
         transform: translateX(400px);
         transition: transform 0.3s ease;
         z-index: 1001;
         font-weight: 500;
     }
     
     .delete-toast.show {
         transform: translateX(0);
     }
     
     .delete-toast i {
         color: #38a169;
         font-size: 1.1em;
     }
    
    @media (max-width: 768px) {
        .page-title {
            font-size: 2.5rem;
        }
        
        .filter-buttons {
            gap: 0.5rem;
        }
        
        .filter-btn {
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        
        .search-input {
            margin-bottom: 1.5rem;
        }
        
        .article-modal-content {
            max-width: 95vw;
            margin: 10px;
            max-height: 95vh;
        }
        
        .article-modal-body {
            padding: 16px;
        }
        
        .article-modal-footer {
            flex-direction: column;
            gap: 8px;
        }
        
        .article-modal-footer .btn {
            width: 100%;
            justify-content: center;
        }
        
        .card-actions {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
        }
        
                 .edit-btn,
         .delete-btn {
             justify-content: center;
         }
         
         .delete-modal-content {
             max-width: 95vw;
             margin: 10px;
         }
         
         .delete-modal-body {
             padding: 20px 16px;
         }
         
         .delete-modal-footer {
             flex-direction: column;
             gap: 8px;
             padding: 16px;
         }
         
         .delete-modal-footer .btn {
             width: 100%;
             justify-content: center;
         }
         
         .delete-toast {
             right: 10px;
             left: 10px;
             transform: translateY(-100px);
         }
         
         .delete-toast.show {
             transform: translateY(0);
         }
    }
`;
document.head.appendChild(writingsStyles); 