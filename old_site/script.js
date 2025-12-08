// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'var(--navbar-scroll)';
        navbar.style.boxShadow = '0 2px 20px var(--shadow)';
    } else {
        navbar.style.background = 'var(--navbar-bg)';
        navbar.style.boxShadow = 'none';
    }
});

// Active section highlighting in navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightActiveSection() {
    let scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// Animate cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.addEventListener('DOMContentLoaded', () => {
    // Load published articles on homepage
    loadHomePageArticles();
    
    const cards = document.querySelectorAll('.writing-card, .paper-card, .project-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
});

// Add copy to clipboard functionality for paper citations
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success message
        const toast = document.createElement('div');
        toast.textContent = 'Citation copied to clipboard!';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    });
}

// Add click events to citation links
document.querySelectorAll('.paper-link[href="#"]').forEach(link => {
    if (link.textContent.includes('Cite')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const paperTitle = link.closest('.paper-card').querySelector('.paper-title').textContent;
            const citation = `@article{${paperTitle.toLowerCase().replace(/\s+/g, '_')},
  title={${paperTitle}},
  author={Leart Ajvazaj},
  year={2024},
  journal={Journal Name}
}`;
            copyToClipboard(citation);
        });
    }
});

// Add smooth reveal animation for sections
const revealElements = document.querySelectorAll('.section-title, .hero-content, .about-content');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// Add CSS for reveal animation
const style = document.createElement('style');
style.textContent = `
    .section-title, .hero-content, .about-content {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .section-title.revealed, .hero-content.revealed, .about-content.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-link.active {
        color: #667eea !important;
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
`;
document.head.appendChild(style);

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Automatic theme switching based on time of day
function initializeTheme() {
    const now = new Date();
    const hour = now.getHours();
    
    // Define day/night hours (6 AM to 6 PM is day time)
    const isDayTime = hour >= 6 && hour < 18;
    
    // Check if user has a manual preference stored
    const storedTheme = localStorage.getItem('theme-preference');
    
    if (storedTheme === 'manual') {
        // User has manually set theme, respect their choice
        const manualTheme = localStorage.getItem('manual-theme');
        setTheme(manualTheme || (isDayTime ? 'light' : 'dark'));
    } else {
        // Auto-switch based on time
        const autoTheme = isDayTime ? 'light' : 'dark';
        setTheme(autoTheme);
        localStorage.setItem('auto-theme', autoTheme);
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle button if it exists
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

function toggleThemeManually() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
    
    // Store manual preference
    localStorage.setItem('theme-preference', 'manual');
    localStorage.setItem('manual-theme', newTheme);
}

function resetToAutoTheme() {
    localStorage.removeItem('theme-preference');
    localStorage.removeItem('manual-theme');
    initializeTheme();
}

// Check time every hour to update theme automatically
function startAutoThemeChecker() {
    setInterval(() => {
        const themePreference = localStorage.getItem('theme-preference');
        if (themePreference !== 'manual') {
            initializeTheme();
        }
    }, 60 * 60 * 1000); // Check every hour
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    startAutoThemeChecker();
    createThemeToggle();
});

// Create modern theme toggle button
function createThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 1.3rem;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Add hover effects
    themeToggle.addEventListener('mouseenter', () => {
        themeToggle.style.transform = 'scale(1.1)';
        themeToggle.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.4)';
    });
    
    themeToggle.addEventListener('mouseleave', () => {
        themeToggle.style.transform = 'scale(1)';
        themeToggle.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
    });
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        toggleThemeManually();
        showThemeMessage();
    });
    
    // Double-click to reset to auto mode
    themeToggle.addEventListener('dblclick', () => {
        resetToAutoTheme();
        showAutoMessage();
    });
    
    document.body.appendChild(themeToggle);
}

// Show theme change message
function showThemeMessage() {
    const message = document.createElement('div');
    message.textContent = 'Theme manually set. Double-click to return to auto mode.';
    message.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        box-shadow: 0 4px 20px var(--shadow);
        z-index: 1001;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        max-width: 200px;
        text-align: center;
        border: 1px solid var(--border-color);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '1';
        message.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(message), 300);
    }, 3000);
}

// Show auto mode message
function showAutoMessage() {
    const message = document.createElement('div');
    message.textContent = 'Switched to automatic theme based on time of day.';
    message.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        box-shadow: 0 4px 20px var(--shadow);
        z-index: 1001;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        max-width: 200px;
        text-align: center;
        border: 1px solid var(--border-color);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '1';
        message.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(message), 300);
    }, 3000);
}

// Language functionality removed - site is now English only

// Add dark theme styles
const darkThemeStyles = document.createElement('style');
darkThemeStyles.textContent = `
    .dark-theme {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
    }
    
    .dark-theme .navbar {
        background: rgba(26, 26, 26, 0.95) !important;
    }
    
    .dark-theme .nav-link {
        color: #e0e0e0 !important;
    }
    
    .dark-theme .section-alt {
        background: #2d2d2d !important;
    }
    
    .dark-theme .writing-card,
    .dark-theme .paper-card,
    .dark-theme .project-card {
        background: #2d2d2d !important;
        border-color: #404040 !important;
    }
    
    .dark-theme .card-title a,
    .dark-theme .paper-title,
    .dark-theme .project-title,
    .dark-theme .section-title {
        color: #e0e0e0 !important;
    }
    
    /* Homepage Article Modal Styles */
    .homepage-article-modal {
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
    
    .homepage-article-modal-content {
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
    
    .homepage-article-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e9ecef;
        background: #f8f9fa;
    }
    
    .homepage-article-modal-header h2 {
        margin: 0;
        font-size: 1.5em;
        color: #333;
    }
    
    .close-homepage-article-modal {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    
    .close-homepage-article-modal:hover {
        background: #e9ecef;
    }
    
    .homepage-article-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
    }
    
    .homepage-article-meta-full {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f3f4;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
    }
    
    .homepage-publish-date {
        color: #666;
        font-size: 0.95em;
    }
    
    .homepage-category-badge {
        background: #667eea;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 500;
    }
    
    .homepage-tags-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }
    
    .homepage-tag {
        background: #f8f9fa;
        color: #495057;
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 0.8em;
        border: 1px solid #e9ecef;
    }
    
    .homepage-article-content-full {
        line-height: 1.7;
        font-size: 1.1em;
    }
    
    .homepage-article-content-full h1,
    .homepage-article-content-full h2,
    .homepage-article-content-full h3 {
        margin-top: 2em;
        margin-bottom: 1em;
    }
    
    .homepage-article-content-full p {
        margin-bottom: 1.5em;
    }
    
    .homepage-article-modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f8f9fa;
    }
    
    .published-article {
        border-left: 4px solid #28a745;
        position: relative;
    }
    
    @media (max-width: 768px) {
        .homepage-article-modal-content {
            max-width: 95vw;
            margin: 10px;
            max-height: 95vh;
        }
        
        .homepage-article-modal-body {
            padding: 16px;
        }
        
        .homepage-article-modal-footer {
            flex-direction: column;
            gap: 8px;
        }
        
        .homepage-article-modal-footer .btn {
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(darkThemeStyles);

// Functions for loading published articles on homepage
function loadHomePageArticles() {
    const homeWritingsGrid = document.getElementById('homeWritingsGrid');
    if (!homeWritingsGrid) return;

    const publishedArticles = getHomePagePublishedArticles();
    const staticArticles = getStaticArticles();
    
    // Combine published and static articles
    const allArticles = [...publishedArticles, ...staticArticles];
    
    // Sort all articles by their display date
    const sortedArticles = sortArticlesByDisplayDate(allArticles);
    
    // Clear the grid and rebuild it with sorted articles
    homeWritingsGrid.innerHTML = '';
    
    // Limit to 6 most recent articles for the homepage
    const recentArticles = sortedArticles.slice(0, 6);
    
    recentArticles.forEach(article => {
        const articleCard = article.isStatic ? 
            createStaticArticleCard(article) : 
            createHomePageArticleCard(article);
        homeWritingsGrid.appendChild(articleCard);
    });
}

function getHomePagePublishedArticles() {
    const articles = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('article_')) {
            try {
                const article = JSON.parse(localStorage.getItem(key));
                if (article.status === 'published') {
                    // Add display date for consistent sorting
                    article.displayDate = getDisplayDate(article);
                    article.isStatic = false;
                    articles.push(article);
                }
            } catch (e) {
                console.error('Error parsing saved article:', e);
            }
        }
    }
    return articles;
}

function getStaticArticles() {
    // Static articles from the homepage HTML - 6 most recent articles
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
            title: "Nuk ka fiteus. Ka veç numra",
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
        }
    ];
}

function getDisplayDate(article) {
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

function parseDateString(dateStr) {
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

function sortArticlesByDisplayDate(articles) {
    return articles.sort((a, b) => {
        const dateA = parseDateString(a.displayDate);
        const dateB = parseDateString(b.displayDate);
        return dateB - dateA; // Most recent first
    });
}

function createStaticArticleCard(article) {
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
        <a href="${article.href}" class="read-more">Read More</a>
    `;
    
    return card;
}

function createHomePageArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'writing-card published-article';
    card.setAttribute('data-category', article.category || 'personal');
    
    card.innerHTML = `
        <div class="card-meta">
            <span class="date">${article.displayDate}</span>
            <span class="category">${getHomePageCategoryDisplayName(article.category)}</span>
        </div>
        <h3 class="card-title">
            ${article.htmlFilename ? 
                `<a href="${article.htmlFilename}">${article.title}</a>` :
                `<a href="#" onclick="openHomePageArticle('${article.id}')">${article.title}</a>`}
        </h3>
        <p class="card-excerpt">
            ${article.excerpt || extractHomePageExcerpt(article.content)}
        </p>
        ${article.htmlFilename ? 
            `<a href="${article.htmlFilename}" class="read-more">Read More</a>` :
            `<a href="#" onclick="openHomePageArticle('${article.id}')" class="read-more">Read More</a>`}
    `;
    
    return card;
}

function getHomePageCategoryDisplayName(category) {
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

function extractHomePageExcerpt(htmlContent) {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
}

function openHomePageArticle(articleId) {
    const article = JSON.parse(localStorage.getItem(`article_${articleId}`));
    if (article) {
        // Create a modal to display the full article
        showHomePageArticleModal(article);
    }
}

function showHomePageArticleModal(article) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'homepage-article-modal';
    modal.innerHTML = `
        <div class="homepage-article-modal-content">
            <div class="homepage-article-modal-header">
                <h2>${article.title}</h2>
                <button class="close-homepage-article-modal" onclick="closeHomePageArticleModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="homepage-article-modal-body">
                <div class="homepage-article-meta-full">
                    <span class="homepage-publish-date">${new Date(article.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    ${article.category ? `<span class="homepage-category-badge">${getHomePageCategoryDisplayName(article.category)}</span>` : ''}
                    ${article.tags && article.tags.length > 0 ? `<div class="homepage-tags-list">${article.tags.map(tag => `<span class="homepage-tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
                <div class="homepage-article-content-full">
                    ${typeof article.content === 'string' ? article.content : ''}
                </div>
            </div>
            <div class="homepage-article-modal-footer">
                <button class="btn btn-secondary" onclick="closeHomePageArticleModal()">Close</button>
                <a href="writings.html" class="btn btn-primary">
                    <i class="fas fa-book"></i> View All Writings
                </a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHomePageArticleModal();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', handleHomePageEscapeKey);
}

function closeHomePageArticleModal() {
    const modal = document.querySelector('.homepage-article-modal');
    if (modal) {
        modal.remove();
    }
    document.removeEventListener('keydown', handleHomePageEscapeKey);
}

function handleHomePageEscapeKey(e) {
    if (e.key === 'Escape') {
        closeHomePageArticleModal();
    }
} 