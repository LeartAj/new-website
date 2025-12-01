// Technical Work Display JavaScript

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
    
    // Remove duplicates - prioritize saved works over static works
    const savedTitles = savedWorks.map(work => work.title.toLowerCase());
    const filteredStaticWorks = staticWorks.filter(work => 
        !savedTitles.includes(work.title.toLowerCase())
    );
    
    // Combine filtered static works with saved works
    const allWorks = [...savedWorks, ...filteredStaticWorks];
    
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
        {
            title: "Combinatorics",
            type: "notes",
            date: "October 2023",
            authors: "Leart Ajvazaj",
            instructor: "Bela Bollobas",
            venue: "University of Cambridge",
            abstract: "Notes from the Part III combinatorics class taught in the Michaelmas term of 2023 by Professor Bela Bollobas. Any mistake is with very high likelihood mine.",
            tags: ["Combinatorics", "Graph Theory", "Discrete Mathematics"],
            pdfPath: "combinatorics.html",
            downloadPdf: "papers/combinatorics.pdf",
            texPath: "papers/combinatorics.tex",
            isStatic: true
        },
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
            title: "Teoria e Numrave per Olimpiada",
            type: "presentations",
            date: "December 2022",
            authors: "Leart Ajvazaj",
            instructor: "",
            venue: "",
            abstract: "Nje hyrje ne teorine e numrave per olimpiada matematike",
            tags: [],
            pdfPath: "teoria_e_numrave_per_olimpiada.html",
            downloadPdf: "papers/teoria_e_numrave_per_olimpiada.pdf",
            texPath: "papers/teoria_e_numrave_per_olimpiada.tex",
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
    if (dateStr.match(/^[A-Za-z]+ \d{4}$/)) {
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
        ` • <i class="fas fa-chalkboard-teacher"></i> ${work.instructor}` : '';
    
    card.innerHTML = `
        <div class="card-meta">
            <span class="date">${work.date}</span>
            <span class="category">${getCategoryDisplay(work.type)}</span>
            <span class="institution">${work.venue}</span>
        </div>
        <h3 class="card-title">
            <a href="${work.pdfPath}">${work.title}</a>
        </h3>
        <p class="card-authors">
            <i class="fas fa-user"></i> ${work.authors}${instructorInfo}
        </p>
        <p class="card-abstract">
            ${work.abstract}
        </p>
        <div class="card-tags">
            ${work.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="card-actions">
            <a href="${work.pdfPath}" class="action-btn primary">
                <i class="fas fa-file-pdf"></i> View PDF
            </a>
            ${work.downloadPdf ? `<a href="${work.downloadPdf}" download class="action-btn secondary">
                <i class="fas fa-download"></i> Download PDF
            </a>` : ''}
            ${work.texPath ? `<a href="${work.texPath}" download class="action-btn secondary">
                <i class="fas fa-code"></i> LaTeX Source
            </a>` : ''}
        </div>
    `;
    
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
}