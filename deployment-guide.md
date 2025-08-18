# Deployment Guide for Audio-to-Text App

## Why the App Doesn't Work on Other Devices

Your audio-to-text application uses modern web technologies that require specific configurations and browser support. Here are the main reasons why it might work on your device but not others:

### 1. Missing Security Headers ⚠️

**Critical Issue**: Your app requires specific HTTP headers to enable SharedArrayBuffer and WebAssembly features:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

**Why this matters**:
- AI models require SharedArrayBuffer for efficient memory usage
- These headers are automatically set by Vite dev server but may be missing in production
- Without these headers, the app will fail to load AI models

### 2. Browser Compatibility Issues

**Supported Browsers**:
- ✅ Chrome 88+ (Best support)
- ✅ Firefox 95+ (Good support)  
- ✅ Edge 88+ (Good support)
- ⚠️ Safari 15+ (Limited support, especially on iOS)
- ❌ Internet Explorer (Not supported)

**iOS/Safari Limitations**:
- WebAssembly restrictions
- AudioContext limitations
- Memory constraints
- Different audio codec support

### 3. Device Requirements

**Minimum Requirements**:
- 2GB+ RAM (4GB+ recommended)
- Modern CPU (2018+)
- Stable internet connection (for model download)
- JavaScript enabled

## Deployment Solutions

### Option 1: Vercel (Recommended)

Your `vercel.json` is already configured correctly:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy", 
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

Create `_headers` file in your `public` folder:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### Option 3: Apache Server

Add to `.htaccess`:

```apache
<IfModule mod_headers.c>
    Header always set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Cross-Origin-Opener-Policy "same-origin"
</IfModule>
```

### Option 4: Nginx

Add to server block:

```nginx
add_header Cross-Origin-Embedder-Policy "require-corp" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
```

### Option 5: Cloudflare Pages

Create `_headers` file:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

## Testing Your Deployment

### 1. Check Headers

Use browser dev tools or online tools to verify headers:

```bash
curl -I https://your-domain.com
```

Look for:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### 2. Test Cross-Origin Isolation

Open browser console and check:

```javascript
console.log('Cross-origin isolated:', crossOriginIsolated)
console.log('SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined')
```

Both should return `true`.

### 3. Compatibility Check

The app now includes built-in compatibility checking that will:
- Detect device capabilities
- Show warnings for potential issues
- Prevent transcription on incompatible devices
- Provide helpful error messages

## Common Issues & Solutions

### Issue: "SharedArrayBuffer is not defined"
**Solution**: Add security headers to your hosting platform

### Issue: "WebAssembly not supported" 
**Solution**: Update browser or use supported browser

### Issue: Works locally but not in production
**Solution**: Check that security headers are properly configured in production

### Issue: Slow or failing on mobile
**Solutions**:
- Use smaller audio files (under 2 minutes)
- Recommend desktop browsers for best performance
- Consider implementing a fallback API service for mobile

### Issue: iOS Safari problems
**Solutions**:
- Ensure iOS 15+ 
- Use Safari (not Chrome/Firefox on iOS)
- Keep audio files small
- Consider server-side processing for iOS users

## Performance Optimization

### For Better Device Compatibility:

1. **Model Selection**: The app tries multiple model fallbacks
2. **Memory Management**: Includes cleanup and garbage collection
3. **Timeout Handling**: Prevents hanging on slow devices
4. **Progressive Loading**: Shows download progress
5. **Graceful Degradation**: Falls back from WebGPU to CPU

### Recommended User Flow:

1. Show compatibility check on first visit
2. Display device-specific recommendations
3. Allow users to proceed with warnings
4. Provide clear error messages for failures
5. Suggest alternative browsers/devices when needed

## Monitoring & Analytics

Consider adding:
- Browser/device analytics
- Error tracking (Sentry, etc.)
- Performance monitoring
- User feedback collection

This will help you understand which devices/browsers your users struggle with and optimize accordingly.
