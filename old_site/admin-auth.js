// Invisible Admin Authentication System
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.adminKey = 'leart_admin_2024'; // Change this to your preferred key
        this.keySequence = [];
        this.targetSequence = ['l', 'e', 'a', 'r', 't']; // Secret key sequence
        this.lastKeyTime = 0;
        this.keyTimeout = 2000; // 2 seconds between keys
        
        this.init();
    }
    
    init() {
        // Check if already authenticated with timeout (30 minutes)
        const authStatus = localStorage.getItem('admin_auth');
        const authTimestamp = localStorage.getItem('admin_auth_timestamp');
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (authStatus === 'true' && authTimestamp && (now - parseInt(authTimestamp)) < thirtyMinutes) {
            this.isAuthenticated = true;
        } else {
            // Clear expired authentication
            this.logout();
        }
        
        // Set up invisible key listener
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Initialize UI based on auth state
        this.updateUI();
        
        // Set up automatic logout after 30 minutes of inactivity
        this.setupAutoLogout();
    }
    
    handleKeyPress(event) {
        // Only process if not in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const currentTime = Date.now();
        const key = event.key.toLowerCase();
        
        // Check for logout sequence (type "logout" to manually logout)
        if (this.isAuthenticated) {
            this.logoutSequence = this.logoutSequence || [];
            this.logoutSequence.push(key);
            
            // Keep sequence length manageable
            if (this.logoutSequence.length > 6) {
                this.logoutSequence.shift();
            }
            
            // Check if we have the logout sequence
            if (this.logoutSequence.join('') === 'logout') {
                this.logout();
                this.showToast('Admin logged out', 'info');
                this.logoutSequence = [];
                return;
            }
        } else {
            this.logoutSequence = [];
        }
        
        // Reset sequence if too much time has passed
        if (currentTime - this.lastKeyTime > this.keyTimeout) {
            this.keySequence = [];
        }
        
        this.lastKeyTime = currentTime;
        
        // Add key to sequence
        this.keySequence.push(key);
        
        // Keep sequence length manageable
        if (this.keySequence.length > this.targetSequence.length) {
            this.keySequence.shift();
        }
        
        // Check if sequence matches
        if (this.keySequence.length === this.targetSequence.length) {
            if (this.keySequence.join('') === this.targetSequence.join('')) {
                this.authenticate();
                this.keySequence = []; // Reset sequence
            }
        }
    }
    
    authenticate() {
        this.isAuthenticated = true;
        // Use localStorage instead of sessionStorage for persistence across pages
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_auth_timestamp', Date.now().toString());
        this.updateUI();
        this.showToast('Admin mode activated', 'success');
    }
    
    setupAutoLogout() {
        // Update timestamp on user activity to prevent auto-logout
        const updateActivity = () => {
            if (this.isAuthenticated) {
                localStorage.setItem('admin_auth_timestamp', Date.now().toString());
            }
        };
        
        // Track user activity
        document.addEventListener('click', updateActivity);
        document.addEventListener('keydown', updateActivity);
        document.addEventListener('mousemove', updateActivity);
        
        // Check for expired authentication every minute
        setInterval(() => {
            if (this.isAuthenticated) {
                const authTimestamp = localStorage.getItem('admin_auth_timestamp');
                const now = Date.now();
                const thirtyMinutes = 30 * 60 * 1000;
                
                if (!authTimestamp || (now - parseInt(authTimestamp)) > thirtyMinutes) {
                    this.logout();
                    this.showToast('Admin session expired', 'info');
                }
            }
        }, 60000); // Check every minute
    }
    
    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_auth_timestamp');
        this.updateUI();
    }
    
    updateUI() {
        // Hide/show Write tab
        const writeTab = document.querySelector('a[href="write.html"]');
        if (writeTab) {
            writeTab.style.display = this.isAuthenticated ? 'block' : 'none';
            writeTab.style.setProperty('display', this.isAuthenticated ? 'block' : 'none', 'important');
        }
        
        // Hide/show admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.setProperty('display', this.isAuthenticated ? 'block' : 'none', 'important');
        });
        
        // Update chess admin authentication
        if (window.isAdminAuthenticated !== undefined) {
            window.isAdminAuthenticated = this.isAuthenticated;
        }
        
        // Show/hide edit/delete buttons on articles
        this.updateArticleControls();
        
        // Update writings page if we're on it
        this.updateWritingsPageControls();
    }
    
    updateArticleControls() {
        // Add edit/delete buttons to published articles if admin is authenticated (for homepage)
        const articleCards = document.querySelectorAll('.published-article');
        
        articleCards.forEach(card => {
            // Remove existing admin controls
            const existingControls = card.querySelector('.admin-controls');
            if (existingControls) {
                existingControls.remove();
            }
            
            if (this.isAuthenticated) {
                // Add admin controls
                const controls = document.createElement('div');
                controls.className = 'admin-controls';
                controls.innerHTML = `
                    <button class="admin-btn edit-btn" onclick="editArticle(this)" title="Edit Article">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="admin-btn delete-btn" onclick="deleteArticle(this)" title="Delete Article">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                card.appendChild(controls);
            }
        });
    }
    
    updateWritingsPageControls() {
        // Handle writings page controls specifically
        const writingsCards = document.querySelectorAll('.writing-card.published-article');
        
        writingsCards.forEach(card => {
            const cardActions = card.querySelector('.card-actions');
            if (!cardActions) return;
            
            // Remove existing admin buttons
            const existingEditBtn = cardActions.querySelector('.edit-btn');
            const existingDeleteBtn = cardActions.querySelector('.delete-btn');
            if (existingEditBtn) existingEditBtn.remove();
            if (existingDeleteBtn) existingDeleteBtn.remove();
            
            if (this.isAuthenticated) {
                // Add admin buttons
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                editBtn.onclick = () => {
                    // Extract article ID from the card
                    const titleLink = card.querySelector('.card-title a');
                    if (titleLink && titleLink.onclick) {
                        const match = titleLink.onclick.toString().match(/openPublishedArticle\('([^']+)'\)/);
                        if (match) {
                            const articleId = match[1];
                            window.location.href = `write.html?edit=${articleId}`;
                        }
                    }
                };
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
                deleteBtn.onclick = () => {
                    // Extract article ID from the card
                    const titleLink = card.querySelector('.card-title a');
                    if (titleLink && titleLink.onclick) {
                        const match = titleLink.onclick.toString().match(/openPublishedArticle\('([^']+)'\)/);
                        if (match) {
                            const articleId = match[1];
                            if (window.deletePublishedArticle) {
                                window.deletePublishedArticle(articleId);
                            }
                        }
                    }
                };
                
                cardActions.appendChild(editBtn);
                cardActions.appendChild(deleteBtn);
            }
        });
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : '#667eea',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Public method to check authentication
    isAdmin() {
        return this.isAuthenticated;
    }
}

// Global admin authentication instance
window.adminAuth = new AdminAuth();

// Global functions for article management
window.editArticle = function(button) {
    if (!window.adminAuth.isAdmin()) return;
    
    const card = button.closest('.writing-card');
    const titleLink = card.querySelector('.card-title a');
    
    // Extract article ID from onclick or data attributes
    let articleId = null;
    
    if (titleLink.onclick) {
        const match = titleLink.onclick.toString().match(/openHomePageArticle\('([^']+)'\)/);
        if (match) {
            articleId = match[1];
        }
    }
    
    if (articleId) {
        // Redirect to write.html with article ID for editing
        window.location.href = `write.html?edit=${articleId}`;
    } else {
        window.adminAuth.showToast('Cannot edit this article', 'error');
    }
};

window.deleteArticle = function(button) {
    if (!window.adminAuth.isAdmin()) return;
    
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return;
    }
    
    const card = button.closest('.writing-card');
    const titleLink = card.querySelector('.card-title a');
    
    // Extract article ID
    let articleId = null;
    
    if (titleLink.onclick) {
        const match = titleLink.onclick.toString().match(/openHomePageArticle\('([^']+)'\)/);
        if (match) {
            articleId = match[1];
        }
    }
    
    if (articleId) {
        // Delete from localStorage
        localStorage.removeItem(`article_${articleId}`);
        
        // Remove the card from UI
        card.remove();
        
        window.adminAuth.showToast('Article deleted successfully', 'success');
        
        // Reload articles if on homepage
        if (typeof loadHomePageArticles === 'function') {
            loadHomePageArticles();
        }
    } else {
        window.adminAuth.showToast('Cannot delete this article', 'error');
    }
};

// Add admin control styles
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .admin-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 5px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    
    .writing-card:hover .admin-controls {
        opacity: 1;
    }
    
    .admin-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s ease;
    }
    
    .edit-btn {
        background: #28a745;
        color: white;
    }
    
    .edit-btn:hover {
        background: #218838;
        transform: scale(1.1);
    }
    
    .delete-btn {
        background: #dc3545;
        color: white;
    }
    
    .delete-btn:hover {
        background: #c82333;
        transform: scale(1.1);
    }
    
    .writing-card {
        position: relative;
    }
    
    /* Ensure admin-only elements are initially hidden */
    a[href="write.html"],
    .admin-only {
        display: none !important;
    }
    
    .admin-toast {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
`;

document.head.appendChild(adminStyles);