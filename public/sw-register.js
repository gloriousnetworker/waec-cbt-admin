// public/sw-register.js (main registration script)
(function() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const swPath = isChrome ? '/chrome-sw.js' : '/sw.js';
  
    console.log(`SW Register: ${isChrome ? 'Chrome' : isFirefox ? 'Firefox' : 'Other'} browser detected`);
  
    function registerWithRetry(attempt = 1) {
      navigator.serviceWorker.register(swPath)
        .then(registration => {
          console.log('SW Register: Success');
          
          if (registration.installing) {
            registration.installing.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                console.log('SW: Activated');
              }
            });
          }
          
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch(error => {
          console.log(`SW Register: Attempt ${attempt} failed`);
          if (attempt < 3) {
            setTimeout(() => registerWithRetry(attempt + 1), 3000);
          }
        });
    }
  
    if (document.readyState === 'complete') {
      setTimeout(registerWithRetry, 2000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerWithRetry, 2000);
      });
    }
  })();