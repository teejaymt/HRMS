# Business on Air (BOA) - HRMS Branding Guide

## 🎨 Brand Identity

**Company Name:** Business on Air  
**Abbreviation:** BOA  
**Tagline:** Human Resource Management System

---

## 🎯 Logo Elements

### Primary Logo
- **File:** `/public/logo.svg`
- **Usage:** Login page, headers, documents
- **Dimensions:** 200x60px
- **Elements:** 
  - Cloud with airplane icon (left)
  - "Business on Air" text (center)
  - "Human Resource Management" subtitle

### Icon Logo
- **File:** `/public/logo-icon.svg`
- **Usage:** Sidebar, favicon, mobile apps
- **Dimensions:** 60x60px (square)
- **Elements:**
  - Circular background with gradient
  - White airplane over cloud

---

## 🎨 Color Palette

### Primary Colors
```css
/* Blue Gradient - Main Brand */
Primary Dark:   #2C5282  (rgb(44, 82, 130))
Primary:        #3182CE  (rgb(49, 130, 206))
Primary Light:  #4299E1  (rgb(66, 153, 225))

/* Cyan Accent */
Cyan Dark:      #319795  (rgb(49, 151, 149))
Cyan:           #38B2AC  (rgb(56, 178, 172))
Cyan Light:     #4FD1C5  (rgb(79, 209, 197))
```

### Sidebar Colors
```css
Background:     linear-gradient(to bottom, #1E3A8A, #1E40AF, #1E3A8A)
Border:         #1D4ED8  (Blue-700)
Active Item:    #1D4ED8  (Blue-700) with shadow
Hover:          rgba(29, 78, 216, 0.5)  (Blue-700/50)
Text:           #DBEAFE  (Blue-100)
Badge:          linear-gradient(to right, #06B6D4, #3B82F6)
```

### UI Elements
```css
/* Buttons */
Primary Button:     linear-gradient(to right, #2563EB, #06B6D4)
Primary Hover:      linear-gradient(to right, #1D4ED8, #0891B2)

/* Backgrounds */
Page Background:    linear-gradient(to bottom-right, #EFF6FF, #ECFEFF, #DBEAFE)
Card Background:    #FFFFFF
Card Border:        #BFDBFE  (Blue-200)

/* Text */
Heading:           linear-gradient(to right, #2563EB, #0891B2) (gradient text)
Body:              #1F2937  (Gray-800)
Secondary:         #6B7280  (Gray-500)
```

---

## 📐 Typography

### Font Family
- **Primary:** System default (Geist Sans, Arial, sans-serif)
- **Monospace:** Geist Mono (for code/data)

### Font Weights
- **Bold:** 700 (Headings, buttons)
- **Medium:** 500 (Navigation, labels)
- **Regular:** 400 (Body text)

### Font Sizes
```css
/* Headings */
H1: 2.25rem (36px)  - Page titles
H2: 1.875rem (30px) - Section headers
H3: 1.5rem (24px)   - Card titles

/* Body */
Base:    0.875rem (14px)  - Main content
Small:   0.75rem (12px)   - Captions, metadata
Tiny:    0.625rem (10px)  - Footer, copyright
```

---

## 🖼️ Logo Usage Guidelines

### DO's ✅
- Use on white or light backgrounds for best visibility
- Maintain aspect ratio when resizing
- Keep clear space around logo (minimum 20px)
- Use SVG format for scalability
- Use icon version in small spaces (sidebar, mobile)

### DON'Ts ❌
- Don't stretch or distort the logo
- Don't change gradient colors
- Don't add effects (shadows, outlines)
- Don't place on busy backgrounds
- Don't rotate the logo

---

## 🎯 Brand Applications

### Login Page
- Full logo centered at top
- Gradient background (blue to cyan)
- White card with rounded corners
- Gradient button (blue to cyan)
- "Powered by Business on Air" footer

### Sidebar
- Icon logo + text at top
- Blue gradient background
- White/light blue text
- Active items highlighted with blue-700
- Copyright footer at bottom

### Page Headers
- Company name in gradient text
- Department/module name in gray
- Breadcrumb navigation

### Buttons
- Primary: Blue-to-cyan gradient
- Secondary: Blue outline
- Danger: Red solid
- Success: Green solid

### Cards
- White background
- Light blue border
- Rounded corners (8px)
- Shadow on hover

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar visible
- Logo with text
- Multiple columns for data

### Tablet (768px - 1023px)
- Collapsible sidebar
- Icon-only navigation
- Two columns for data

### Mobile (<768px)
- Hidden sidebar (hamburger menu)
- Icon logo only
- Single column layout

---

## 🎨 Component Styling Examples

### Primary Button
```jsx
<button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200">
  Action
</button>
```

### Card
```jsx
<div className="bg-white rounded-lg shadow border border-blue-100 p-6">
  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
    Card Title
  </h3>
  <p className="text-gray-600 mt-2">Card content</p>
</div>
```

### Badge
```jsx
<span className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
  New
</span>
```

---

## 📄 File Structure

```
hrms-frontend/
├── public/
│   ├── logo.svg              # Full logo (200x60)
│   └── logo-icon.svg         # Icon logo (60x60)
├── app/
│   ├── layout.tsx            # Title & favicon
│   └── auth/
│       └── login/
│           └── page.tsx      # Branded login
└── components/
    └── layout/
        └── Sidebar.tsx       # Branded sidebar
```

---

## 🚀 Implementation Checklist

- [x] Logo files created (SVG)
- [x] Sidebar branding applied
- [x] Login page redesigned
- [x] Color scheme updated
- [x] Button styles standardized
- [x] Page title updated
- [x] Favicon added
- [x] Footer branding
- [ ] Email templates (future)
- [ ] PDF reports (future)
- [ ] Mobile app (future)

---

## 📞 Support

For branding questions or logo modifications:
- **Company:** Business on Air
- **Product:** HRMS v1.0.0
- **Last Updated:** January 2026

---

**© 2026 Business on Air. All rights reserved.**
