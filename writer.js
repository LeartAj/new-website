// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ]
    },
    placeholder: 'Start writing your article...'
});

// Set today's date by default
document.getElementById('articleDate').valueAsDate = new Date();

// Generate filename from title
function generateFilename(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '.html';
}

// Format date to display format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Generate HTML file
function generateHTML() {
    const title = document.getElementById('articleTitle').value.trim();
    const date = document.getElementById('articleDate').value;
    const category = document.getElementById('articleCategory').value;
    const excerpt = document.getElementById('articleExcerpt').value.trim();
    const content = quill.root.innerHTML;
    const featuredOnHome = document.getElementById('featuredOnHome').checked;

    if (!title) {
        alert('Please enter an article title');
        return;
    }

    if (!date) {
        alert('Please select a date');
        return;
    }

    if (!category) {
        alert('Please select a category');
        return;
    }

    const formattedDate = formatDate(date);
    const filename = generateFilename(title);

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Leart Ajvazaj</title>

    <link rel="stylesheet" href="main.css">
    <link rel="stylesheet" href="pillnav.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

    <style>
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 120px 20px 60px;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--color-primary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-bottom: 2rem;
            border-bottom: 1px solid transparent;
            padding-bottom: 2px;
        }

        .back-link:hover {
            border-bottom-color: var(--color-primary);
            transform: translateX(-4px);
        }

        .article-meta {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--color-border);
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .article-date {
            color: var(--color-text-light);
            font-size: 0.9rem;
        }

        .article-category {
            display: inline-block;
            background: var(--color-primary);
            color: var(--color-bg);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .article-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 1rem 0;
            line-height: 1.3;
        }

        .article-excerpt {
            font-size: 1.2rem;
            color: var(--color-text-light);
            font-style: italic;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: transparent;
            border: 2px solid var(--color-border);
            border-radius: var(--radius-md);
            line-height: 1.7;
        }

        .article-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--color-text);
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
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: var(--color-text);
            font-weight: 700;
        }

        .article-content blockquote {
            border-left: 4px solid var(--color-primary);
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: var(--color-text-light);
        }

        .article-content a {
            color: var(--color-primary);
            text-decoration: none;
            border-bottom: 1px solid var(--color-border);
            transition: all 0.3s ease;
        }

        .article-content a:hover {
            border-bottom-color: var(--color-primary);
        }

        .article-content code {
            background: var(--color-border);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }

        .article-content pre {
            background: var(--color-border);
            padding: 1.5rem;
            border-radius: var(--radius-md);
            overflow-x: auto;
            margin: 2rem 0;
            border: 1px solid var(--color-border);
        }

        .article-content img {
            max-width: 100%;
            height: auto;
            border-radius: var(--radius-md);
            margin: 2rem 0;
            border: 2px solid var(--color-border);
        }

        .article-content em {
            text-align: center;
            display: block;
            font-size: 0.9rem;
            color: var(--color-text-light);
        }

        @media (max-width: 768px) {
            .article-title {
                font-size: 2rem;
            }

            .article-container {
                padding: 100px 15px 40px;
            }

            .article-content {
                font-size: 1rem;
            }

            .article-excerpt {
                font-size: 1.1rem;
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <div class="pill-nav-container" id="nav-container">
        <nav class="pill-nav" aria-label="Primary">
            <a class="pill-logo" href="index.html" aria-label="Home" id="logo-link">
                <img src="logo2white.svg" alt="Logo" id="logo-img">
            </a>

            <div class="pill-nav-items desktop-only" id="nav-items">
                <ul class="pill-list" role="menubar">
                    <li role="none">
                        <a role="menuitem" href="index.html" class="pill" aria-label="Home" data-index="0">
                            <span class="hover-circle" aria-hidden="true"></span>
                            <span class="label-stack">
                                <span class="pill-label">Home</span>
                                <span class="pill-label-hover" aria-hidden="true">Home</span>
                            </span>
                        </a>
                    </li>
                    <li role="none">
                        <a role="menuitem" href="writings.html" class="pill is-active" aria-label="Writings" data-index="1">
                            <span class="hover-circle" aria-hidden="true"></span>
                            <span class="label-stack">
                                <span class="pill-label">Writings</span>
                                <span class="pill-label-hover" aria-hidden="true">Writings</span>
                            </span>
                        </a>
                    </li>
                    <li role="none">
                        <a role="menuitem" href="technical.html" class="pill" aria-label="Technical" data-index="2">
                            <span class="hover-circle" aria-hidden="true"></span>
                            <span class="label-stack">
                                <span class="pill-label">Technical</span>
                                <span class="pill-label-hover" aria-hidden="true">Technical</span>
                            </span>
                        </a>
                    </li>
                    <li role="none">
                        <a role="menuitem" href="faq-recommendations.html" class="pill" aria-label="FAQ" data-index="3">
                            <span class="hover-circle" aria-hidden="true"></span>
                            <span class="label-stack">
                                <span class="pill-label">FAQ</span>
                                <span class="pill-label-hover" aria-hidden="true">FAQ</span>
                            </span>
                        </a>
                    </li>
                    <li role="none">
                        <a role="menuitem" href="index.html#about" class="pill" aria-label="About" data-index="4">
                            <span class="hover-circle" aria-hidden="true"></span>
                            <span class="label-stack">
                                <span class="pill-label">About</span>
                                <span class="pill-label-hover" aria-hidden="true">About</span>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>

            <button class="mobile-menu-button mobile-only" id="mobile-menu-btn" aria-label="Toggle menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </nav>

        <div class="mobile-menu-popover mobile-only" id="mobile-menu">
            <ul class="mobile-menu-list">
                <li>
                    <a href="index.html" class="mobile-menu-link">Home</a>
                </li>
                <li>
                    <a href="writings.html" class="mobile-menu-link is-active">Writings</a>
                </li>
                <li>
                    <a href="technical.html" class="mobile-menu-link">Technical</a>
                </li>
                <li>
                    <a href="faq-recommendations.html" class="mobile-menu-link">FAQ</a>
                </li>
                <li>
                    <a href="index.html#about" class="mobile-menu-link">About</a>
                </li>
            </ul>
        </div>
    </div>

    <!-- Article Content -->
    <main class="article-container">
        <a href="writings.html" class="back-link">
            ← Back to Writings
        </a>

        <div class="article-meta">
            <span class="article-date">${formattedDate}</span>
            <span class="article-category">${category}</span>
        </div>

        <h1 class="article-title">${title}</h1>
        ${excerpt ? `
        <div class="article-excerpt">${excerpt}</div>` : ''}

        <div class="article-content">
            ${content}
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p class="footer-text">&copy; 2025 Leart Ajvazaj. All rights reserved.</p>
        </div>
    </footer>

    <!-- Dark Mode Toggle Button -->
    <button class="dark-mode-toggle" id="dark-mode-toggle" aria-label="Toggle dark mode">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="currentColor"/>
        </svg>
    </button>

    <script src="app.js"></script>
</body>
</html>`;

    // Generate updated writings.js
    const updatedWritingsJs = generateUpdatedWritingsJs(title, formattedDate, category, excerpt, filename);

    // Show modal with generated HTML and writings.js
    document.getElementById('htmlOutput').value = htmlTemplate;
    document.getElementById('suggestedFilename').textContent = filename;
    document.getElementById('writingsJsOutput').value = updatedWritingsJs;
    document.getElementById('htmlModal').style.display = 'flex';

    // Store for download
    window.currentArticleData = {
        htmlTemplate,
        filename,
        updatedWritingsJs
    };
}

// Preview article
function previewArticle() {
    const title = document.getElementById('articleTitle').value.trim();
    const date = document.getElementById('articleDate').value;
    const category = document.getElementById('articleCategory').value;
    const excerpt = document.getElementById('articleExcerpt').value.trim();
    const content = quill.root.innerHTML;

    if (!title) {
        alert('Please enter an article title');
        return;
    }

    const formattedDate = formatDate(date || new Date().toISOString().split('T')[0]);

    const previewHTML = `
        <div class="article-meta">
            <span class="article-date">${formattedDate}</span>
            ${category ? `<span class="article-category">${category}</span>` : ''}
        </div>
        <h1 class="article-title">${title}</h1>
        ${excerpt ? `<div class="article-excerpt">${excerpt}</div>` : ''}
        <div class="article-content">
            ${content}
        </div>
    `;

    document.getElementById('previewArticle').innerHTML = previewHTML;
    document.getElementById('previewModal').style.display = 'flex';
}

// Close preview modal
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Close HTML modal
function closeHTMLModal() {
    document.getElementById('htmlModal').style.display = 'none';
}

// Copy HTML to clipboard
function copyHTML() {
    const htmlOutput = document.getElementById('htmlOutput');
    htmlOutput.select();
    document.execCommand('copy');

    showToast('HTML copied to clipboard!');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const previewModal = document.getElementById('previewModal');
    const htmlModal = document.getElementById('htmlModal');

    if (event.target === previewModal) {
        closePreview();
    }
    if (event.target === htmlModal) {
        closeHTMLModal();
    }
}

// Generate updated writings.js with new article
function generateUpdatedWritingsJs(title, formattedDate, category, excerpt, filename) {
    // Get the category value for data attribute (lowercase, hyphenated)
    const categoryValue = category.toLowerCase().replace(/\s+/g, '-');

    const newArticle = {
        title: title,
        displayDate: formattedDate,
        category: categoryValue,
        categoryDisplay: category,
        excerpt: excerpt,
        href: filename,
        isStatic: true
    };

    // Get existing articles
    const existingArticles = getStaticArticles();

    // Add new article at the beginning (most recent)
    const allArticles = [newArticle, ...existingArticles];

    // Generate the writings.js file content
    const writingsJsContent = `// Writings page functionality
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    // Load all articles
    loadArticles();

    // Setup filtering
    setupFiltering();

    // Setup search
    setupSearch();
}

// Static articles data
function getStaticArticles() {
    return ${JSON.stringify(allArticles, null, 8)};
}

// Load and display articles
function loadArticles() {
    const writingsGrid = document.getElementById('writings-grid');
    if (!writingsGrid) return;

    const staticArticles = getStaticArticles();

    // Sort by date (most recent first)
    const sortedArticles = staticArticles.sort((a, b) => {
        const dateA = parseDate(a.displayDate);
        const dateB = parseDate(b.displayDate);
        return dateB - dateA;
    });

    // Clear grid
    writingsGrid.innerHTML = '';

    // Add articles
    sortedArticles.forEach(article => {
        const articleCard = createArticleCard(article);
        writingsGrid.appendChild(articleCard);
    });
}

// Parse date string to Date object
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    return new Date(0);
}

// Create article card element
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'writing-card';
    card.setAttribute('data-category', article.category || 'personal');

    card.innerHTML = \\\`
        <div class="card-meta">
            <span class="date">\\\${article.displayDate}</span>
            <span class="category">\\\${article.categoryDisplay}</span>
        </div>
        <h3 class="card-title">
            <a href="\\\${article.href}">\\\${article.title}</a>
        </h3>
        <p class="card-excerpt">
            \\\${article.excerpt}
        </p>
        <a href="\\\${article.href}" class="read-more">Read More</a>
    \\\`;

    return card;
}

// Setup filter functionality
function setupFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter cards
            filterArticles(filterValue);
        });
    });
}

// Filter articles by category
function filterArticles(category) {
    const writingCards = document.querySelectorAll('.writing-card');

    writingCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        searchArticles(searchTerm);
    });
}

// Search articles
function searchArticles(searchTerm) {
    const writingCards = document.querySelectorAll('.writing-card');

    writingCards.forEach(card => {
        const title = card.querySelector('.card-title a')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.card-excerpt')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.category')?.textContent.toLowerCase() || '';

        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}
`;

    return writingsJsContent;
}

// Download HTML file
function downloadHTML() {
    if (!window.currentArticleData) return;

    const blob = new Blob([window.currentArticleData.htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = window.currentArticleData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('HTML file downloaded!');
}

// Download writings.js file
function downloadWritingsJs() {
    if (!window.currentArticleData) return;

    const blob = new Blob([window.currentArticleData.updatedWritingsJs], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'writings.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('writings.js downloaded!');
}

// Copy writings.js to clipboard
function copyWritingsJs() {
    const writingsJsOutput = document.getElementById('writingsJsOutput');
    writingsJsOutput.select();
    document.execCommand('copy');

    showToast('writings.js copied to clipboard!');
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('successToast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
