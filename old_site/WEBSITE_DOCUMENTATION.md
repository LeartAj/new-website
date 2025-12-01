# Personal Website Documentation

## Overview

This is a personal academic/professional website for Leart Ajvazaj, featuring writings, technical papers, projects, and an interactive chess game. The site includes a seamless admin authentication system for content management.

## 🏗️ **Site Structure**

### Core Pages
- **`index.html`** - Homepage with hero section, recent writings, technical work, chess game, projects, and about section
- **`writings.html`** - Complete writings archive with filtering
- **`write.html`** - Admin-only article creation/editing interface
- **`technical.html`** - Technical papers and academic work
- **Various article pages** - Individual articles in Albanian and English

### Key Features
- 📱 Responsive design with mobile navigation
- 🌙 Automatic day/night theme switching
- ♟️ Interactive collaborative chess game
- 📝 Rich text article editor with publishing system
- 🔒 Invisible admin authentication system

## 🔐 **Admin Authentication System**

### Overview
The website uses a seamless, invisible authentication system that hides admin features from visitors while providing full content management capabilities to the administrator.

### Authentication Method
- **Secret Key Sequence**: Type `"leart"` anywhere on the website (case-insensitive)
- **No Visible Interface**: No login forms, buttons, or hints visible to visitors
- **Persistent Authentication**: Authentication persists across page navigations for 30 minutes
- **Auto-Logout**: Automatically expires after 30 minutes of inactivity
- **Manual Logout**: Type `"logout"` while authenticated to manually log out

### How to Access Admin Mode

1. **Navigate to any page** of the website
2. **Type `"leart"`** (without quotes) - can be typed anywhere except in input fields
3. **Green notification** appears: "Admin mode activated"
4. **Admin features** become visible and accessible

### Protected Features

#### Hidden from Visitors
- ✅ "Write" tab in navigation (completely invisible)
- ✅ Edit/Delete buttons on published articles
- ✅ Write page (redirects to homepage if not authenticated)
- ✅ Article management functions

#### Visible to Admin (after authentication)
- ✅ "Write" tab appears in navigation
- ✅ Edit/Delete buttons appear on hover over published articles
- ✅ Full access to write.html
- ✅ Article creation, editing, and deletion
- ✅ Automatic chess admin access

## 📝 **Content Management System**

### Article Creation
1. **Access**: Type `"leart"` to authenticate, then click "Write" tab
2. **Rich Editor**: Full-featured Quill.js editor with formatting options
3. **Metadata**: Title, category, tags, excerpt, and custom publish date
4. **Image Upload**: Drag & drop or click to upload images
5. **Auto-Save**: Drafts saved automatically every 30 seconds

### Article Management
- **Edit**: Click edit button on any published article (admin only)
- **Delete**: Click delete button with confirmation prompt (admin only)
- **Preview**: Live preview before publishing
- **Publishing Options**:
  - Public (visible to everyone)
  - Unlisted (accessible via direct link only)
  - Draft (saved for later)

### Content Storage
- **Local Storage**: Articles stored in browser localStorage
- **HTML Generation**: Published articles generate downloadable HTML files
- **File Naming**: Automatic slug generation from article titles

## ♟️ **Chess Game System**

### Game Features
- **Collaborative Play**: Visitors play as White collectively
- **Admin Plays Black**: Owner plays as Black when online
- **Persistent State**: Game state saved across sessions
- **Move Validation**: Full chess rule validation including castling, en passant
- **Draw Detection**: Automatic detection of draws by repetition and 50-move rule

### Chess Admin Access
- **Authentication**: Requires password for Black moves (`chess2024leart`)
- **Console Commands**: `makeAdminMove("e7", "e5")` for programmatic moves
- **Auto-Admin**: Automatic admin access when website admin is authenticated

### Game Controls
- **Click to Move**: Click piece, then destination square
- **Board Flip**: Button to rotate board view
- **Reset Game**: Start new game (with confirmation)
- **Move History**: Complete move notation history

## 🎨 **Theme System**

### Automatic Theme Switching
- **Day Mode**: 6 AM - 6 PM (light theme)
- **Night Mode**: 6 PM - 6 AM (dark theme)
- **Manual Override**: Click theme toggle button to set manually
- **Auto Return**: Double-click theme button to return to automatic mode

### Theme Features
- **Smooth Transitions**: Animated theme changes
- **Persistent Preferences**: Remembers manual theme settings
- **Cross-Page Consistency**: Theme applies across all pages
- **Custom Properties**: CSS custom properties for easy theme management

## 📁 **File Structure**

```
website/
├── index.html              # Homepage
├── writings.html           # Writings archive
├── write.html             # Admin writing interface
├── technical.html         # Technical papers
├── admin-auth.js          # Admin authentication system
├── script.js              # Main site functionality
├── writer.js              # Article editor functionality
├── writings.js            # Writings page functionality
├── styles.css             # Main styles
├── writer-styles.css      # Writing interface styles
├── medium-styles.css      # Medium-style article formatting
├── images/                # Image assets
├── papers/                # PDF papers and TeX sources
└── [article-files].html  # Individual published articles
```

## 🛠️ **Technical Implementation**

### JavaScript Architecture
- **Modular Design**: Separate JS files for different functionality
- **ES6+ Features**: Modern JavaScript with classes and modules
- **Local Storage**: Client-side data persistence
- **Event Delegation**: Efficient event handling

### CSS Architecture
- **CSS Custom Properties**: Theming system
- **Flexbox/Grid**: Modern layout techniques
- **Mobile-First**: Responsive design approach
- **Component-Based**: Reusable component styles

### Key Dependencies
- **Quill.js**: Rich text editor for article creation
- **Font Awesome**: Icon library
- **Google Fonts**: Inter font family
- **No Framework**: Vanilla JavaScript implementation

## 🚀 **Deployment & Usage**

### Local Development
1. **Clone/Download** the website files
2. **Open** `index.html` in a web browser
3. **Type `"leart"`** to access admin features
4. **Start creating** and managing content

### Publishing Articles
1. **Create** article in write.html
2. **Publish** with desired settings
3. **Download** generated HTML file
4. **Place** HTML file in website root directory
5. **Article** automatically appears in listings

### Adding New Content
- **Static Articles**: Edit HTML directly in `index.html` and `writings.html`
- **Dynamic Articles**: Use the admin interface
- **Papers**: Add PDF files to `papers/` directory and update `technical.html`
- **Images**: Upload to `images/` directory

## 🔧 **Customization**

### Admin Authentication
- **Change Secret Key**: Modify `targetSequence` in `admin-auth.js`
- **Chess Password**: Update `adminPassword` in chess game script
- **Timeout**: Adjust `keyTimeout` for key sequence timing

### Styling
- **Colors**: Modify CSS custom properties in `styles.css`
- **Typography**: Change font imports and CSS font families
- **Layout**: Adjust grid and flexbox properties

### Functionality
- **Auto-Save Interval**: Modify interval in `writer.js`
- **Theme Hours**: Adjust day/night hours in `script.js`
- **Chess Rules**: Modify chess validation in chess game script

## 📱 **Mobile Responsiveness**

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Mobile Features
- **Hamburger Menu**: Collapsible navigation
- **Touch-Friendly**: Large touch targets
- **Optimized Typography**: Readable text sizes
- **Responsive Chess**: Adapted chess board for mobile

## 🔍 **SEO & Performance**

### Optimization Features
- **Semantic HTML**: Proper heading hierarchy and structure
- **Meta Tags**: Title and viewport meta tags
- **Fast Loading**: Minimal dependencies and optimized assets
- **Progressive Enhancement**: Works without JavaScript for basic content

### Performance Tips
- **Image Optimization**: Compress images before upload
- **Minification**: Minify CSS/JS for production
- **CDN**: Use CDN for external dependencies
- **Caching**: Implement browser caching headers

## 🐛 **Troubleshooting**

### Common Issues

**Admin Login Not Working**
- Ensure you're not typing in an input field
- Check browser console for JavaScript errors
- Try refreshing the page and typing sequence again

**Articles Not Saving**
- Check browser localStorage limits
- Verify JavaScript is enabled
- Clear localStorage if corrupted: `localStorage.clear()`

**Chess Game Issues**
- Refresh page to reset game state
- Check console for move validation errors
- Use reset button to start fresh game

**Theme Not Switching**
- Clear browser cache
- Check system time for automatic switching
- Try manual theme toggle

### Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript Required**: Core functionality requires JavaScript
- **Local Storage**: Required for admin features and content management

## 📊 **Analytics & Monitoring**

### Content Analytics
- **Article Views**: Track via analytics service
- **Popular Content**: Monitor most-read articles
- **User Engagement**: Chess game participation

### Technical Monitoring
- **Performance**: Page load times
- **Errors**: JavaScript console errors
- **Compatibility**: Cross-browser testing

## 🔒 **Security Considerations**

### Client-Side Security
- **No Sensitive Data**: All data stored locally
- **Session-Based Auth**: No persistent credentials
- **Input Validation**: Sanitized user inputs in editor

### Best Practices
- **Regular Backups**: Export articles periodically
- **Access Control**: Admin features properly hidden
- **Error Handling**: Graceful error handling throughout

## 📈 **Future Enhancements**

### Potential Features
- **Server-Side Storage**: Database integration
- **User Comments**: Comment system for articles
- **Social Sharing**: Share buttons for articles
- **Analytics Dashboard**: Admin analytics interface
- **Multi-Author**: Support for multiple authors

### Technical Improvements
- **PWA Features**: Service worker for offline access
- **Build System**: Webpack/Vite integration
- **TypeScript**: Type safety improvements
- **Testing**: Automated testing suite

---

## 📞 **Support**

For technical issues or questions about the website:
1. Check this documentation
2. Review browser console for errors
3. Test in different browsers
4. Clear browser cache and localStorage

**Remember**: Type `"leart"` anywhere on the site to access admin features!