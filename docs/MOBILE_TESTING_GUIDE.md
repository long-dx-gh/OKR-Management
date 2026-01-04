# 🧪 Mobile Optimization Testing Guide

## Quick Start Testing

### 1. Start Development Server
```bash
cd /Users/daoxuanlong/Downloads/OKR
npm run dev
```

### 2. Open in Browser
```
http://localhost:5175/OKR-Management
```

### 3. Enable Mobile View
**Chrome DevTools:**
- Press `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)
- Select device: **iPhone 12 Pro** or **Pixel 5**
- Reload page

---

## 📋 Mobile Testing Checklist

### Header (48px height)
- [ ] Back button is visible (icon only)
- [ ] Title "OKR Visualization" is visible and truncated if needed
- [ ] Stats badges show "9N" and "7C" format
- [ ] Total height is approximately 48px
- [ ] No text wrapping

### Filter Button
- [ ] Single button visible: "🔍 Bộ lọc & Tùy chỉnh"
- [ ] Button height is 44px (easy to tap)
- [ ] Active filter badge shows when filters are applied
- [ ] Badge displays correct count (1-3)

### Bottom Sheet - Filters
- [ ] Tapping filter button opens bottom sheet
- [ ] Sheet slides up smoothly (300ms animation)
- [ ] Backdrop appears with 50% opacity
- [ ] Draggable handle visible at top
- [ ] Status dropdown works
- [ ] Range slider:
  - [ ] Two thumbs are draggable
  - [ ] Blue track shows selected range
  - [ ] Number inputs sync with slider
  - [ ] Values constrain to 0-100
- [ ] Time dropdown works
- [ ] Custom date inputs appear when "Tùy chỉnh" selected
- [ ] "Xóa tất cả bộ lọc" button appears when filters active
- [ ] "Áp dụng" button at bottom
- [ ] Tapping backdrop closes sheet
- [ ] Tapping X closes sheet

### Chart Canvas
- [ ] Chart occupies ~90% of viewport
- [ ] No vertical page scroll (only canvas zoom/pan)
- [ ] No horizontal scroll anywhere
- [ ] Height is `calc(100vh - 140px)`

### Touch Gestures
- [ ] **Pinch to Zoom** (2 fingers):
  - [ ] Zoom in works smoothly
  - [ ] Zoom out works smoothly
  - [ ] Min zoom: 0.1x
  - [ ] Max zoom: 4x
- [ ] **Pan** (1 finger):
  - [ ] Dragging canvas pans the view
  - [ ] Smooth, no lag
  - [ ] Doesn't interfere with node dragging
- [ ] **Tap Node**:
  - [ ] Tapping a node selects it
  - [ ] Selected node shows blue ring
  - [ ] Node detail modal opens
- [ ] **Drag Node**:
  - [ ] Nodes can be repositioned
  - [ ] Edges update in real-time
  - [ ] Other nodes react (force layout)

### Node Sizing
- [ ] Nodes are 20% larger than desktop (1.2x multiplier)
- [ ] Minimum node size is ~36px diameter (easy to tap)
- [ ] Labels are readable
- [ ] Progress rings are visible

### Floating Action Buttons (FABs)
- [ ] **Legend Button** (bottom-left):
  - [ ] Visible at bottom-left
  - [ ] 48px × 48px
  - [ ] White background
  - [ ] Info icon (ℹ)
  - [ ] Shadow visible
  - [ ] Tapping opens legend sheet
  
- [ ] **Realtime Indicator** (top-right):
  - [ ] Visible at top-right
  - [ ] 44px × 44px
  - [ ] Green when active, white when offline
  - [ ] Wifi icon changes state
  - [ ] Pulse animation when active
  
- [ ] **Refresh Button** (top-right, below realtime):
  - [ ] 44px × 44px
  - [ ] White background
  - [ ] Refresh icon
  - [ ] Tapping reloads data
  - [ ] Scale-down feedback on tap

### Legend Bottom Sheet
- [ ] Opens when tapping legend FAB
- [ ] Shows user/owner (purple circle)
- [ ] Shows objectives with status colors:
  - [ ] Green = On-track
  - [ ] Yellow = At-risk
  - [ ] Red = Off-track
- [ ] Shows key results (blue circle)
- [ ] Shows touch tips:
  - [ ] Chạm để chọn node
  - [ ] Kéo để di chuyển nodes
  - [ ] 2 ngón tay để zoom
  - [ ] 1 ngón tay để pan
- [ ] Tips section has blue background

### Node Detail Modal
- [ ] Opens when tapping a node
- [ ] Full-screen overlay
- [ ] Header with back button
- [ ] Node type badge visible
- [ ] Status badge visible
- [ ] Title shown
- [ ] Description shown (if any)
- [ ] Progress bar animated
- [ ] Target/unit displayed
- [ ] Owner name shown
- [ ] Due date formatted correctly
- [ ] Back button closes modal

### Performance
- [ ] Animations are smooth (60fps)
- [ ] No lag when panning
- [ ] Zoom is responsive
- [ ] Bottom sheet opens instantly
- [ ] No frame drops during node drag

### Edge Cases
- [ ] Landscape orientation still works
- [ ] Screen rotation doesn't break layout
- [ ] Multiple filter applications work
- [ ] Clearing all filters works
- [ ] No data state shows properly
- [ ] Loading state shows skeleton

---

## 📱 Desktop Testing Checklist (>1024px)

### Layout Verification
- [ ] Desktop layout is **unchanged** from original
- [ ] Header shows full text "Quay lại"
- [ ] Stats show "9 Nodes" and "7 Connections" (full text)
- [ ] Description line visible under title
- [ ] Fullscreen button visible

### Filter Panel
- [ ] All filters visible inline
- [ ] Status dropdown in first column
- [ ] Progress range (two inputs) visible
- [ ] Visual progress bar shows range
- [ ] Time dropdown visible
- [ ] Custom date inputs appear inline
- [ ] "Xóa" button visible when filters active
- [ ] Active filter count badge visible
- [ ] Realtime badge shows correctly
- [ ] Refresh button visible
- [ ] Export button visible

### Chart Canvas
- [ ] Desktop zoom controls visible (top-right of canvas)
- [ ] Zoom in button works
- [ ] Zoom out button works
- [ ] Reset zoom button works
- [ ] Keyboard shortcuts work:
  - [ ] Ctrl/Cmd + Plus = Zoom in
  - [ ] Ctrl/Cmd + Minus = Zoom out
  - [ ] Ctrl/Cmd + 0 = Reset
- [ ] Tooltips appear on hover

### Legend
- [ ] Legend card visible (bottom-left)
- [ ] Expanded by default
- [ ] Can be collapsed to icon
- [ ] X button toggles visibility
- [ ] Tips section visible

### Side Panel
- [ ] Clicking node opens side panel (right side)
- [ ] Panel is 320px wide
- [ ] Node details shown
- [ ] Close button (X) works
- [ ] Panel slides in from right

### No Mobile Elements
- [ ] No bottom sheets appear
- [ ] No FABs visible
- [ ] No mobile-specific buttons

---

## 🐛 Common Issues & Solutions

### Issue: Horizontal scroll appears
**Solution:** Check that parent container has `overflow-x: hidden`

### Issue: Pull-to-refresh on iOS
**Solution:** Verify `overscroll-behavior: none` is applied to canvas

### Issue: Pinch zoom not working
**Solution:** Check `touch-action: none` on SVG element

### Issue: FABs overlap chart controls
**Solution:** Adjust z-index (FABs should be z-10, canvas controls z-[1])

### Issue: Bottom sheet doesn't scroll
**Solution:** Check max-height is set and overflow-y: auto

### Issue: Range slider thumbs overlap
**Solution:** Ensure z-index on min thumb increases when near max

---

## 📊 Performance Benchmarks

### Target Metrics
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Zoom response:** < 16ms (60fps)
- **Pan response:** < 16ms (60fps)
- **Bottom sheet animation:** 300ms smooth

### Measuring Tools
```bash
# Lighthouse (Mobile)
npm run build
npx serve dist
# Open Chrome DevTools → Lighthouse → Mobile
```

---

## 🎥 Testing Scenarios

### Scenario 1: First-time User
1. Open page on mobile
2. See full-screen chart immediately
3. Pinch to zoom in
4. Tap legend FAB
5. Read tips
6. Close legend
7. Tap filter button
8. Adjust range slider
9. Apply filters
10. See chart update

**Expected:** Smooth, intuitive flow

### Scenario 2: Power User
1. Open page
2. Tap filter button quickly
3. Set status to "At-risk"
4. Set progress 50-100%
5. Set time to "This quarter"
6. Apply
7. Tap node to see details
8. Drag node to reposition
9. Tap refresh FAB
10. See updated data

**Expected:** Responsive, no delays

### Scenario 3: Desktop User
1. Open page on desktop (1440px)
2. Use inline filters
3. Click zoom controls
4. Use keyboard shortcuts
5. Open sidebar by clicking node
6. Toggle legend visibility

**Expected:** Identical to original behavior

---

## ✅ Sign-off Criteria

Before marking as complete:
- [ ] All mobile checklist items pass
- [ ] All desktop checklist items pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Lighthouse score >90 (mobile)
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Physical device tested (optional but recommended)

---

## 📸 Visual Regression Testing

### Screenshots to Capture

**Mobile (375x812 - iPhone 12 Pro):**
1. Initial page load
2. Filter button with badge
3. Bottom sheet open
4. Range slider interaction
5. Legend bottom sheet
6. Node detail modal
7. FABs visible

**Desktop (1440x900):**
1. Initial page load
2. Inline filters
3. Zoom controls
4. Legend card expanded
5. Legend card collapsed
6. Side panel open

---

**Happy Testing! 🚀**
