console.log('Module imported: haswipenavigation.js loaded');  // Runs first, confirms import

(function waitForHA(attempt = 0) {
  console.log('Wait attempt:', attempt, 'HA root hass available?', !!(document.querySelector('home-assistant')?.hass));

  // Wait for HA root and hass to load (max 50 attempts ~5s)
  const root = document.querySelector('home-assistant');
  if (!root || !root.hass) {
    if (attempt < 50) {
      return setTimeout(() => waitForHA(attempt + 1), 100);
    } else {
      console.error('Wait timeout: HA root or hass not loaded after 5s');
      return;
    }
  }

  console.log('HA loaded successfully, proceeding with script');

  // Proceed with script (hass is available via root.hass)
  const hass = root.hass;  // Use root.hass instead of window.hass for reliability

  // Only activate on specific kiosk dashboards
  const currentPath = window.location.pathname;

  // Here is where you declare your dashboard tab names/paths - these are what I use so change them to match yours
  // Don't forget to update the slug names - check line 70
  // These tabs are created in order in my Home Assistant:
  // [kiosk_home] <--> [kiosk (default landing page when touch screens boot)] <--> [kiosk_cameras]
  const kioskPaths = ['/lovelace/kiosk_home', '/lovelace/kiosk', '/lovelace/kiosk_cameras'];
  if (!kioskPaths.includes(currentPath)) {
    console.log('Swipe script: Not a kiosk dashboard, exiting:', currentPath);
    return;  // Exit early if not a kiosk dashboard
  }
  console.log('Swipe script loaded on kiosk dashboard:', currentPath);

  // Create overlay for swipe detection
  const overlay = document.createElement('div');
  overlay.id = 'swipe-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    pointer-events: none !important;  /* Always none: no event blocking */
    touch-action: pan-x !important;  /* Hint for horizontal swipes (may help browser) */
    opacity: 0 !important;  /* Invisible; change to 0.3 and background: red for testing */
    background: transparent !important;
  `;
  document.body.appendChild(overlay);
  console.log('Invisible overlay created');

  let startX = 0;
  let startY = 0;
  let startTime = 0;  // Track start time for gesture duration (helps distinguish taps from swipes)
  let isSwiping = false;  // Track if gesture is active
  const minSwipeDistance = 50;  // Minimum horizontal distance for swipe (pixels)
  const maxSwipeAngle = 30;     // Max vertical angle for horizontal swipe (degrees)
  const maxTapTime = 300;       // Max time for a tap (ms); longer may be swipe even if short distance
  const minTapDistance = 10;    // If movement < this, treat as tap regardless of time

  // Helper to perform navigation (shared logic)
  const performNavigation = (direction) => {
    const currentSlug = window.location.pathname.split('/').pop();
    console.log('Dynamic current slug:', currentSlug, 'Swipe direction:', direction);

    let nextPath = null;
    // Update slug names to match the correct paths - check line 29 for more info
    if (direction === 'right') {  // Swipe right: to previous
      if (currentSlug === 'kiosk') {
        nextPath = '/lovelace/kiosk_home';
      } else if (currentSlug === 'kiosk_cameras') {
        nextPath = '/lovelace/kiosk';
      }
    } else if (direction === 'left') {  // Swipe left: to next
      if (currentSlug === 'kiosk') {
        nextPath = '/lovelace/kiosk_cameras';
      } else if (currentSlug === 'kiosk_home') {
        nextPath = '/lovelace/kiosk';
      }
    }
    // You can add as many tabs as you want to. You just have to update
    // the above logic to match each step in the navigation chain.

    console.log('Next path:', nextPath);
    if (nextPath) {
      console.log('Performing navigation to:', nextPath);
      history.pushState(null, null, nextPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      console.log('Navigation dispatched');
    } else {
      console.log('No valid navigation for this swipe');
    }
  };

  // Touch events on document (captures all touches without blocking)
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isSwiping = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      console.log('Touchstart captured (document):', startX, startY);
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (isSwiping && e.touches.length === 1) {
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > minTapDistance) {  // If moving horizontally beyond tap threshold
        e.preventDefault();  // Block default (e.g., scroll) during potential swipe
        console.log('Touchmove: Preventing default for horizontal movement');
      }
    }
  }, { passive: false });  // Allow preventDefault

  document.addEventListener('touchend', (e) => {
    if (isSwiping && e.changedTouches.length === 1) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      console.log('Touchend: Delta', deltaX, deltaY, 'Duration:', duration + 'ms');

      // Check if it's a tap (short distance and time): do nothing, let event bubble to target
      if (absDeltaX < minTapDistance && absDeltaY < minTapDistance && duration < maxTapTime) {
        console.log('Detected as tap: Allowing normal interaction');
        isSwiping = false;
        return;  // Exit early, no interference
      }

      // Otherwise, evaluate for swipe
      if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
        const angle = Math.atan2(absDeltaY, absDeltaX) * (180 / Math.PI);
        console.log('Angle:', angle);
        if (angle < maxSwipeAngle) {
          const direction = deltaX > 0 ? 'right' : 'left';
          console.log('Valid swipe (touch):', direction);
          performNavigation(direction);
        } else {
          console.log('Too vertical, ignored');
        }
      } else {
        console.log('Insufficient horizontal movement or too vertical');
      }

      isSwiping = false;
    } else {
      isSwiping = false;
    }
  }, { passive: true });

  // Handle touch cancel
  document.addEventListener('touchcancel', () => {
    isSwiping = false;
    console.log('Touchcancel: Reset');
  }, { passive: true });

  // Mouse events fallback on document (for desktop testing)
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) {  // Left button
      isSwiping = true;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      console.log('Mousedown captured (document):', startX, startY);
    }
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (isSwiping) {
      const currentX = e.clientX;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > minTapDistance) {
        e.preventDefault();  // Block default drag/scroll if horizontal
        console.log('Mousemove: Preventing default for horizontal movement');
      }
    }
  }, { passive: false });

  document.addEventListener('mouseup', (e) => {
    if (isSwiping && e.button === 0) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endX = e.clientX;
      const endY = e.clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      console.log('Mouseup: Delta', deltaX, deltaY, 'Duration:', duration + 'ms');

      // Check if it's a click (short distance and time): do nothing, let bubble
      if (absDeltaX < minTapDistance && absDeltaY < minTapDistance && duration < maxTapTime) {
        console.log('Detected as click: Allowing normal interaction');
        isSwiping = false;
        return;  // Exit early
      }

      // Otherwise, evaluate for "swipe" (drag with mouse)
      if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
        const angle = Math.atan2(absDeltaY, absDeltaX) * (180 / Math.PI);
        console.log('Angle:', angle);
        if (angle < maxSwipeAngle) {
          const direction = deltaX > 0 ? 'right' : 'left';
          console.log('Valid drag-swipe (mouse):', direction);
          performNavigation(direction);
        } else {
          console.log('Too vertical, ignored');
        }
      } else {
        console.log('Insufficient horizontal movement or too vertical');
      }

      isSwiping = false;
    } else {
      isSwiping = false;
    }
  }, { passive: true });

  // Prevent context menu (optional)
  document.addEventListener('contextmenu', (e) => {
    // Only if swiping, but for simplicity, allow unless during swipe
    if (isSwiping) {
      e.preventDefault();
    }
  });

  // Cleanup on unload (remove overlay)
  window.addEventListener('beforeunload', () => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      console.log('Overlay cleaned up');
    }
  });
})();
