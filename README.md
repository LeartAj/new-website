# Modern Website with PillNav Navigation

A modern, responsive website implementation featuring an animated pill-style navigation menu with GSAP animations.

## Features

### Navigation (PillNav)
- Animated pill-style navigation menu
- Smooth hover effects with circular expanding backgrounds
- Rotating logo animation on hover
- Mobile-responsive hamburger menu
- Active state indicators
- Smooth scroll navigation
- Scroll-spy functionality (highlights current section)

### Design System
- Modern color palette with CSS custom properties
- Responsive typography using clamp()
- Consistent spacing and layout utilities
- Smooth animations and transitions
- Accessible focus states
- Reduced motion support for accessibility

### Sections
1. **Hero Section**
   - Full-height layout with gradient background
   - Animated entrance effects
   - Call-to-action buttons
   - Responsive text sizing

2. **About Section**
   - Two-column layout (content + stats)
   - Animated stat cards
   - Hover effects

3. **Services Section**
   - Three-column grid (responsive)
   - Service cards with icons
   - Smooth hover animations

4. **Contact Section**
   - Two-column layout (info + form)
   - Contact information display
   - Functional contact form
   - Form validation

5. **Footer**
   - Simple copyright notice
   - Consistent styling

## File Structure

```
/home/leartubuntu/new-website/
├── index.html          # Main HTML structure
├── main.css            # Main stylesheet with design system
├── pillnav.css         # PillNav component styles
├── app.js              # JavaScript for navigation and interactions
├── pillnav.js          # Original React PillNav component (reference)
├── logo.svg            # Logo graphic
└── README.md           # This file
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern layout with Grid and Flexbox
- **JavaScript (ES6+)** - Classes, modules, DOM manipulation
- **GSAP 3.12.5** - Animation library for smooth effects

## Navigation Implementation

The PillNav component has been adapted from React to vanilla JavaScript while maintaining all the original functionality:

### Key Features:
- **Pill hover effect**: Circular background expands from bottom on hover
- **Text animation**: Label slides up and changes color
- **Logo rotation**: 360° rotation on hover
- **Mobile menu**: Animated dropdown with hamburger toggle
- **Responsive**: Desktop pills collapse to mobile menu on small screens

### Color Customization:
The navigation supports custom colors via CSS variables:
- `--base`: Base/background color (default: #fff)
- `--pill-bg`: Pill background color (default: #060010)
- `--hover-text`: Text color on hover (default: #060010)
- `--pill-text`: Pill text color (default: #fff)

## Setup Instructions

1. Ensure all files are in the same directory
2. Open `index.html` in a modern web browser
3. The site requires an internet connection for GSAP CDN

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Changing Navigation Items
Edit the navigation items in `index.html` around line 27-60:
```html
<li role="none">
    <a role="menuitem" href="#your-section" class="pill" aria-label="Your Label" data-index="0">
        <span class="hover-circle" aria-hidden="true"></span>
        <span class="label-stack">
            <span class="pill-label">Your Label</span>
            <span class="pill-label-hover" aria-hidden="true">Your Label</span>
        </span>
    </a>
</li>
```

### Changing Colors
Modify CSS variables in `main.css` (lines 2-9) or `app.js` (lines 297-301).

### Adjusting Animations
Animation parameters can be modified in `app.js` in the `PillNavigation` class options.

## Performance

- Optimized animations using GSAP's FLIP technique
- Hardware-accelerated transforms
- Debounced resize handlers
- Font loading optimization

## Accessibility

- ARIA labels and roles for screen readers
- Keyboard navigation support
- Focus visible states
- Reduced motion support
- Semantic HTML structure

## Credits

Based on the PillNav component design with GSAP animations.
