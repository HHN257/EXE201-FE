# Deep Link Testing Guide

## 🚀 How to Test Your Deep Link Implementation

### 1. **Start the Development Server**

```bash
cd "d:\Documents\Code\EXE201\FE\EXE201-FE"
npm run dev
```

The application should start at `http://localhost:5173` (or similar)

### 2. **Navigate to Services Page**

1. Open your browser and go to `http://localhost:5173`
2. Click on "Services" in the header navigation
3. You should see two tabs: "Local Services" and "Travel Apps"

### 3. **Test Desktop Behavior**

**Expected Behavior on Desktop:**
- Click on any service (Grab, Booking.com, Traveloka)
- Should open the web version in a new tab
- Buttons should show "Visit Website" with external link icon

**Test Steps:**
1. Click "Travel Apps" tab
2. Click "Open App" button for Grab → Should open grab.com
3. Click "Open App" button for Booking.com → Should open booking.com
4. Click "Open App" button for Traveloka → Should open traveloka.com

### 4. **Test Mobile Behavior**

**Option A: Use Chrome DevTools**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Samsung Galaxy, etc.)
4. Refresh the page
5. Navigate to Services → Travel Apps

**Option B: Test on Actual Mobile Device**
1. Get your local IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access `http://[your-ip]:5173` from your mobile device
3. Navigate to Services → Travel Apps

**Expected Mobile Behavior:**
- Buttons should show "Open App" with smartphone icon
- Clicking should attempt to open the native app
- If app not installed, should fall back to web version

### 5. **Test Specific Deep Link Functions**

**Grab Testing:**
- Click "Book Ride" → Should attempt `grab://booking?pickup=Current%20Location&destination=Airport`
- Click "Order Food" → Should attempt `grab://food`

**Booking.com Testing:**
- Click "Find Hotels" → Should attempt `booking://hotels?city=Ho%20Chi%20Minh%20City&checkin=2024-01-01&checkout=2024-01-02`

**Traveloka Testing:**
- Click "Book Flight" → Should attempt `traveloka://flight?from=SGN&to=HAN&departure=2024-01-01`
- Click "Book Hotel" → Should attempt `traveloka://hotel?city=Ho%20Chi%20Minh%20City&checkin=2024-01-01&checkout=2024-01-02`

## 🔍 **Debugging & Troubleshooting**

### Check Browser Console
1. Open DevTools → Console tab
2. Look for any JavaScript errors
3. Check for failed network requests

### Verify Deep Link Attempts
Add this to your browser console to see deep link attempts:
```javascript
// Monitor all link clicks
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        console.log('Button clicked:', e.target);
    }
});
```

### Test Deep Link Detection
```javascript
// Test if you can detect mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('Is Mobile:', isMobile);
console.log('User Agent:', navigator.userAgent);
```

## 📱 **Mobile App Testing**

### Install Apps for Real Testing
1. **Grab**: Download from App Store/Google Play
2. **Booking.com**: Download from App Store/Google Play  
3. **Traveloka**: Download from App Store/Google Play

### Test Deep Links with Apps Installed
1. Access your site on mobile with apps installed
2. Click deep link buttons
3. Should open in the native app
4. If successful, you'll see the app open with pre-filled information

## 🛠 **Manual Deep Link Testing**

You can test deep links directly in browser address bar:

**iOS Safari:**
- Type: `grab://open` and press enter
- Should prompt to open Grab app if installed

**Android Chrome:**
- Type: `intent://open#Intent;scheme=grab;package=com.grabtaxi.passenger;end;`
- More complex but works better on Android

## ⚠ **Common Issues & Solutions**

### Issue: "Page not found" when clicking services
**Solution**: Make sure the routing is properly set up in App.tsx

### Issue: Deep links don't work
**Solutions**:
1. Check if apps are installed on mobile device
2. Verify URL schemes are correct
3. Check browser console for errors
4. Test on different browsers/devices

### Issue: Fallback not working
**Solutions**:
1. Check network connectivity
2. Verify fallback URLs are correct
3. Test timeout logic in deepLinkUtils.ts

### Issue: Styling issues
**Solutions**:
1. Check if ServicesPage.css is imported correctly
2. Verify Bootstrap CSS is loaded
3. Check for CSS conflicts

## 📊 **Performance Testing**

### Check Loading Times
1. Open DevTools → Network tab
2. Navigate to Services page
3. Check resource loading times
4. Verify images load properly

### Memory Usage
1. DevTools → Performance tab
2. Record while navigating to services
3. Check for memory leaks or slow operations

## 🎯 **Success Criteria**

✅ Services page loads without errors
✅ Two tabs (Local Services, Travel Apps) display correctly
✅ External service cards render with logos
✅ Desktop shows "Visit Website" behavior
✅ Mobile shows "Open App" behavior  
✅ Deep links attempt to open apps on mobile
✅ Fallback to web version works when apps not installed
✅ No console errors
✅ Responsive design works on all screen sizes

## 🔄 **Testing Checklist**

- [ ] Start dev server
- [ ] Navigate to Services page
- [ ] Test Local Services tab
- [ ] Test Travel Apps tab
- [ ] Test on desktop browser
- [ ] Test on mobile (DevTools simulation)
- [ ] Test on actual mobile device
- [ ] Verify deep links on mobile with apps installed
- [ ] Verify fallback behavior without apps
- [ ] Check console for errors
- [ ] Test responsive design
- [ ] Test all quick action buttons
- [ ] Verify hover effects work
- [ ] Test image loading and fallbacks