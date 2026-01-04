# 🎨 Mobile-First Development Guide

## 📋 Hướng Dẫn Sử Dụng Responsive Hooks

### 1. **Import Hook**

```typescript
import { useResponsive, useIsMobile, useIsDesktop } from '../hooks/useMediaQuery';
```

### 2. **Sử Dụng Trong Component**

```typescript
function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Conditional rendering
  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### 3. **Conditional Styling**

```typescript
function MyComponent() {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`
      ${isMobile ? 'p-4' : 'p-8'}
      ${isMobile ? 'text-sm' : 'text-base'}
    `}>
      Content
    </div>
  );
}
```

---

## 🎯 Responsive Patterns

### **Pattern 1: Mobile-First Layout**

```typescript
// Desktop: Sidebar + Content
// Mobile: Full-width with toggle sidebar

<div className="flex">
  <Sidebar 
    isOpen={isSidebarOpen}
    onClose={() => setIsSidebarOpen(false)}
  />
  <Content className={isMobile ? 'w-full' : 'flex-1'} />
</div>
```

### **Pattern 2: Modal vs Panel**

```typescript
// Desktop: Side panel
// Mobile: Full-screen modal

{isMobile ? (
  <Modal fullScreen>
    <DetailView />
  </Modal>
) : (
  <Panel>
    <DetailView />
  </Panel>
)}
```

### **Pattern 3: Responsive Typography**

```tsx
// Use Tailwind responsive classes
<h1 className="text-lg lg:text-2xl font-bold">
  Title
</h1>

<p className="text-sm lg:text-base text-gray-600">
  Description
</p>
```

### **Pattern 4: Touch-Friendly Buttons**

```tsx
<button className="
  px-3 lg:px-4 
  py-2.5 lg:py-2 
  touch-manipulation
  active:bg-purple-700
  hover:bg-purple-600
">
  Click Me
</button>
```

---

## 📱 Breakpoints Reference

```typescript
// Tailwind Breakpoints
sm:  640px  // Small phones (landscape)
md:  768px  // Tablets
lg:  1024px // Laptops
xl:  1280px // Desktops
2xl: 1536px // Large desktops

// Our Convention
< 768px   = Mobile
768-1024  = Tablet
>= 1024px = Desktop
```

---

## ✅ Best Practices

### **1. Mobile-First CSS**

```css
/* ❌ Desktop-first (BAD) */
.element {
  padding: 32px; /* Desktop default */
}
@media (max-width: 768px) {
  .element {
    padding: 16px; /* Mobile override */
  }
}

/* ✅ Mobile-first (GOOD) */
.element {
  padding: 16px; /* Mobile default */
}
@media (min-width: 1024px) {
  .element {
    padding: 32px; /* Desktop enhancement */
  }
}
```

### **2. Touch Targets**

```tsx
/* Minimum 44x44px touch targets */
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon />
</button>
```

### **3. Responsive Spacing**

```tsx
/* Use responsive padding */
<div className="p-4 lg:p-8">
  <h1 className="mb-3 lg:mb-6">Title</h1>
  <div className="space-y-3 lg:space-y-4">
    <Item />
  </div>
</div>
```

### **4. Conditional Features**

```tsx
/* Hide non-essential features on mobile */
{!isMobile && <ActivityFeed />}
{!isMobile && <AdvancedFilters />}
```

### **5. Performance Optimization**

```tsx
/* Use memo for expensive responsive components */
const MobileMenu = memo(({ isOpen }) => {
  if (!isOpen) return null;
  return <Menu />;
});
```

---

## 🎨 CSS Utilities

### **Touch Manipulation**

```css
/* Optimize touch response */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

Usage:
```tsx
<button className="touch-manipulation">
  Tap Me
</button>
```

### **Smooth Scrolling**

```css
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

### **Hide Scrollbar**

```css
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

### **Safe Area (iOS)**

```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 🚀 Component Examples

### **Responsive Sidebar**

```tsx
function Sidebar({ isOpen, onClose }) {
  const { isMobile } = useResponsive();
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static
        inset-y-0 left-0
        z-40 w-64
        bg-white
        transform transition-transform
        lg:translate-x-0
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
      `}>
        <nav>...</nav>
      </div>
    </>
  );
}
```

### **Responsive Modal**

```tsx
function Modal({ children, onClose }) {
  const { isMobile } = useResponsive();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`
          bg-white rounded-lg
          ${isMobile ? 'w-full h-full' : 'max-w-2xl max-h-[85vh]'}
          overflow-y-auto
        `}
      >
        {children}
      </div>
    </div>
  );
}
```

### **Responsive List**

```tsx
function OKRList() {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`
      ${isMobile ? 'w-full pt-14' : 'w-96'}
      bg-white overflow-y-auto
    `}>
      <div className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl mb-4">
          Objectives
        </h2>
        <div className="space-y-3 lg:space-y-4">
          {objectives.map(obj => (
            <OKRCard key={obj.id} objective={obj} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### **Mobile Testing**
- [ ] Hamburger menu hoạt động
- [ ] Sidebar slide-out smooth
- [ ] Touch targets đủ lớn (44x44px)
- [ ] Modals full-screen
- [ ] Text readable (min 14px)
- [ ] Forms dễ điền
- [ ] Buttons dễ nhấn
- [ ] Scroll mượt mà

### **Tablet Testing**
- [ ] Layout tối ưu cho 768-1024px
- [ ] Touch-friendly
- [ ] Có thể dùng cả touch và mouse

### **Desktop Testing**
- [ ] Layout không bị thay đổi
- [ ] Spacing như cũ
- [ ] Hover states hoạt động
- [ ] Sidebar luôn visible
- [ ] Multi-column layout

---

## 🎯 Common Patterns

### **1. Responsive Padding**

```tsx
className="p-4 lg:p-8"           // Container
className="px-4 lg:px-6"         // Horizontal only
className="py-3 lg:py-4"         // Vertical only
```

### **2. Responsive Text**

```tsx
className="text-sm lg:text-base"    // Body text
className="text-lg lg:text-2xl"     // Headings
className="text-xs lg:text-sm"      // Small text
```

### **3. Responsive Gaps**

```tsx
className="space-y-3 lg:space-y-4"  // Vertical spacing
className="gap-2 lg:gap-4"          // Flex/Grid gap
```

### **4. Responsive Widths**

```tsx
className="w-full lg:w-96"          // Full on mobile, fixed on desktop
className="w-full lg:w-auto"        // Full on mobile, auto on desktop
```

### **5. Responsive Visibility**

```tsx
className="block lg:hidden"         // Mobile only
className="hidden lg:block"         // Desktop only
className="lg:flex"                 // Flex on desktop
```

---

## 📊 Performance Tips

### **1. Avoid Layout Shifts**

```tsx
/* ❌ BAD: Layout shifts when responsive changes */
{isMobile ? <MobileView /> : <DesktopView />}

/* ✅ GOOD: Use CSS to hide/show */
<div className="block lg:hidden"><MobileView /></div>
<div className="hidden lg:block"><DesktopView /></div>
```

### **2. Lazy Load Heavy Components**

```tsx
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

{view === 'analytics' && (
  <Suspense fallback={<Loading />}>
    <AnalyticsDashboard />
  </Suspense>
)}
```

### **3. Optimize Images**

```tsx
<img 
  src={isMobile ? 'small.jpg' : 'large.jpg'}
  loading="lazy"
  decoding="async"
/>
```

---

## 🎉 Quick Reference

### **Common Classes**

```css
/* Spacing */
p-4 lg:p-8              /* Responsive padding */
gap-2 lg:gap-4          /* Responsive gap */
space-y-3 lg:space-y-4  /* Responsive space */

/* Typography */
text-sm lg:text-base    /* Body text */
text-lg lg:text-2xl     /* Headings */

/* Layout */
w-full lg:w-96          /* Width */
flex-col lg:flex-row    /* Direction */
hidden lg:block         /* Visibility */

/* Interactivity */
touch-manipulation      /* Touch optimize */
active:bg-gray-100      /* Touch feedback */
hover:bg-gray-50        /* Hover state */
```

---

**Happy Coding! 🚀**

*Built with ❤️ for OKR Management Platform*
