# Leart Ajvazaj - Personal Website

A modern, responsive personal website for researchers, academics, and professionals. Built with HTML, CSS, and JavaScript featuring an invisible admin authentication system for content management.

## 🚀 Features

- **Responsive Design**: Looks great on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with smooth animations
- **Invisible Admin Authentication**: Secret key sequence login system for admin features
- **Session Management**: 30-minute timeout with cross-page persistence
- **Interactive Navigation**: Smooth scrolling and active section highlighting
- **Writings Section**: Blog-style layout with filtering and admin edit capabilities
- **Technical Work Section**: Academic papers showcase with chronological ordering
- **FAQ & Recommendations**: Interactive collapsible FAQ system with resource recommendations
- **Projects Gallery**: Portfolio-style project display
- **Social Media Integration**: Links to LinkedIn, Facebook, X (Twitter), and email
- **Performance Optimized**: Fast loading with efficient CSS and JS

## 📁 File Structure

```
website/
├── index.html              # Main homepage
├── writings.html           # Blog/writings page
├── technical.html          # Technical work showcase
├── faq-recommendations.html # FAQ & Recommendations page
├── write.html             # Admin article writer (admin only)
├── technical-manage.html   # Technical work manager (admin only)
├── admin-auth.js          # Admin authentication system
├── styles.css             # Main stylesheet
├── script.js              # Main JavaScript functionality
├── writings.js            # Writings page specific JS
├── technical.js           # Technical page specific JS
├── writer.js              # Article writer functionality
├── medium-styles.css      # Medium-inspired styling
├── medium-integration.js  # Medium-style features
├── papers/                # PDF and LaTeX files directory
└── README.md             # This file
```

## 🔐 Admin Authentication System

### How to Use Admin Features
1. **Login**: Type the secret key sequence "leart" anywhere on the website (no input field needed)
2. **Access Admin Features**: Once logged in, you can see:
   - "Write" tab in navigation
   - Edit/Delete buttons on articles
   - "Manage Works" button on technical page
3. **Logout**: Type "logout" to manually logout, or wait 30 minutes for automatic timeout

### Admin Features
- **Article Writer**: Create and edit blog posts with rich text editor
- **Technical Work Manager**: Add, edit, and organize technical papers
- **Cross-page Persistence**: Stay logged in across all pages
- **Session Security**: Automatic logout after 30 minutes of inactivity

## 🎨 Customization Guide

### 1. Personal Information
Current configuration is set for Leart Ajvazaj. To customize:

- Update name and professional title in `index.html`
- Replace profile photo in homepage
- Update social media links:
  - LinkedIn: https://www.linkedin.com/in/leart-ajvazaj/
  - Facebook: https://www.facebook.com/learti.a/
  - X (Twitter): https://x.com/LeartAjvazaj
  - Email: ajvazaj.leart@gmail.com

### 2. Content Updates

#### Writings/Blog Posts
Edit the writing cards in both `index.html` and `writings.html`:
```html
<article class="writing-card" data-category="your-category">
    <div class="card-meta">
        <span class="date">Your Date</span>
        <span class="category">Your Category</span>
    </div>
    <h3 class="card-title">
        <a href="your-link">Your Title</a>
    </h3>
    <p class="card-excerpt">
        Your excerpt text...
    </p>
    <a href="your-link" class="read-more">Read More</a>
</article>
```

#### Papers
Update the papers section in `index.html`:
```html
<div class="paper-card">
    <div class="paper-icon">
        <i class="fas fa-file-pdf"></i>
    </div>
    <div class="paper-content">
        <h3 class="paper-title">Your Paper Title</h3>
        <p class="paper-authors">Author Names</p>
        <p class="paper-venue">Journal/Conference • Year</p>
        <p class="paper-abstract">Abstract text...</p>
        <div class="paper-links">
            <a href="your-pdf-link" class="paper-link">
                <i class="fas fa-file-pdf"></i> PDF
            </a>
            <!-- Add more links as needed -->
        </div>
    </div>
</div>
```

#### Projects
Update project cards:
```html
<div class="project-card">
    <div class="project-image">
        <img src="your-image-url" alt="Project Name">
    </div>
    <div class="project-content">
        <h3 class="project-title">Project Name</h3>
        <p class="project-description">Description...</p>
        <div class="project-tech">
            <span class="tech-tag">Technology</span>
            <!-- Add more tech tags -->
        </div>
        <div class="project-links">
            <a href="demo-link" class="project-link">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>
            <a href="code-link" class="project-link">
                <i class="fab fa-github"></i> Code
            </a>
        </div>
    </div>
</div>
```

### 3. Color Scheme
To change the color scheme, update these CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;      /* Main brand color */
    --secondary-color: #764ba2;    /* Secondary brand color */
    --text-color: #333;           /* Main text color */
    --text-muted: #666;           /* Muted text color */
    --background: #ffffff;         /* Background color */
    --card-background: #ffffff;    /* Card backgrounds */
}
```

### 4. Typography
The site uses Inter font from Google Fonts. To change:

1. Update the Google Fonts link in HTML files
2. Update the `font-family` in CSS:
```css
body {
    font-family: 'Your-Font', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## 🌐 Deployment Options

### GitHub Pages (Free)
1. Create a GitHub repository
2. Upload your files
3. Go to Settings > Pages
4. Select "Deploy from branch" and choose "main"
5. Your site will be available at `https://yourusername.github.io/repository-name`

### Netlify (Free)
1. Create account at netlify.com
2. Drag and drop your folder to Netlify
3. Get instant deployment with custom domain options

### Vercel (Free)
1. Create account at vercel.com
2. Connect your GitHub repository
3. Automatic deployments on every push

### Traditional Web Hosting
Upload files via FTP to any web hosting provider that supports static websites.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Adding New Features

### Adding a Contact Form
To add a contact form, you can use services like:
- Formspree (https://formspree.io/)
- Netlify Forms (if using Netlify)
- EmailJS (https://www.emailjs.com/)

### Adding a Blog
The website already includes a full blog functionality with:
1. Rich text editor with Quill.js
2. Article management system
3. Category filtering and organization
4. Admin-only editing capabilities

### FAQ & Recommendations Page Features
The website includes a comprehensive FAQ & Recommendations page with:
- **Interactive FAQ System**: Collapsible questions organized by category
- **Math Olympiad Guidance**: Problem-solving strategies and preparation tips
- **College Mathematics Advice**: Course recommendations and transition guidance
- **Machine Learning Resources**: Mathematical foundations and research guidance
- **Book Recommendations**: Curated list of essential texts
- **Online Resources**: Links to blogs, courses, and learning platforms
- **Tab-based Interface**: Easy navigation between FAQ and Recommendations

### Adding Analytics
Add Google Analytics by including the tracking code in the `<head>` section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🐛 Troubleshooting

### Images Not Loading
- Check file paths are correct
- Ensure images are in the same directory or use absolute URLs
- Use placeholder services like `https://via.placeholder.com/` for testing

### JavaScript Not Working
- Check browser console for errors (F12)
- Ensure all file paths are correct
- Verify script tags are properly placed

### Styling Issues
- Clear browser cache (Ctrl+F5)
- Check CSS file path in HTML
- Verify CSS syntax for errors

## 🤝 Contributing

Feel free to customize this template for your needs! If you create improvements or find bugs, consider sharing them with the community.

## 📄 License

This template is free to use for personal and commercial projects. No attribution required, but appreciated!

---

**Need help?** Check the browser console (F12) for any error messages, or review the code comments for guidance on customization. 