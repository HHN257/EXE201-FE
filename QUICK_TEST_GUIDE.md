# 🧪 Quick Testing Steps

## Start Testing Right Now:

### 1. **Start Your Dev Server**
```bash
cd "d:\Documents\Code\EXE201\FE\EXE201-FE"
npm run dev
```

### 2. **Test Routes**
- Main app: `http://localhost:5173`
- Services page: `http://localhost:5173/services`
- Deep link tester: `http://localhost:5173/test-deeplinks`

### 3. **Quick Test Sequence**

**Step 1: Basic Functionality**
1. Go to `/services`
2. Click "Travel Apps" tab
3. Verify you see Grab, Booking.com, Traveloka cards

**Step 2: Desktop Testing**
1. Click any "Open App" button
2. Should open web version in new tab
3. Check browser console for errors

**Step 3: Mobile Simulation**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android
4. Refresh and test again

**Step 4: Debug with Tester**
1. Go to `/test-deeplinks`
2. Click "Test All Services"
3. Watch the results panel

### 4. **Expected Results**

✅ **Desktop**: Opens web versions (grab.com, booking.com, traveloka.com)
✅ **Mobile**: Attempts app deep links, falls back to web
✅ **Console**: No JavaScript errors
✅ **UI**: Cards display correctly with hover effects

### 5. **Common Quick Fixes**

**If nothing happens when clicking buttons:**
- Check browser console for errors
- Make sure all imports are correct
- Verify the routing is set up

**If images don't load:**
- Service logos might be blocked by CORS
- This is normal for external images

**If mobile detection doesn't work:**
- Test the `/test-deeplinks` route
- Check the device info section

### 6. **Pro Testing Tips**

**Test Real Mobile Deep Links:**
1. Install Grab/Booking/Traveloka apps on phone
2. Connect to same WiFi as computer
3. Find your computer's IP: `ipconfig`
4. Access `http://[your-ip]:5173/services` on phone
5. Test deep links - should open actual apps!

**Debug Console Commands:**
```javascript
// Check if mobile detection works
console.log(window.navigator.userAgent);

// Test a deep link manually
window.location.href = 'grab://open';
```

### 7. **Success Indicators**

✅ Services page loads without errors
✅ Two tabs switch correctly
✅ External service cards render
✅ Buttons respond to clicks
✅ Deep links attempt to execute
✅ Fallback behavior works
✅ Mobile detection functions
✅ No console errors

## 🚨 Need Help?

1. Check the detailed guide: `DEEP_LINK_TESTING_GUIDE.md`
2. Use the debug tool: `/test-deeplinks`
3. Check browser console for specific errors
4. Test on different devices/browsers

## 🎯 Ready to Ship?

Once all the above tests pass, your deep link implementation is working correctly!