// Writings page functionality
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
