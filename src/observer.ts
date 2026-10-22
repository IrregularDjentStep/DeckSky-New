import log from './log.ts';


const context = "observer";

let observer: MutationObserver | null = null;
let scanInterval: number | null = null;
let retryTimeout: number | null = null;
let visibilityTimeout: number | null = null;

let debounceTimeout: number | null = null;
let visibilityDocument: Document | null = null;
let visibilityChangeHandler: (() => void) | null = null;

const debouncedScan = () => {
  if (debounceTimeout) return;

  debounceTimeout = requestAnimationFrame(() => {
    scanAndBadge();
    debounceTimeout = null;
  }) as unknown as number;
};

let cachedWindow: Window | null = null;

/**
 * Get the Big Picture window from Decky's navigation trees
 */
export function getBigPictureWindow(): Window | null {
  // Return cached window if it's still valid
  if (cachedWindow && !cachedWindow.closed) {
    return cachedWindow;
  }

  try {
    const DFL = (window as any).DFL;
    if (!DFL?.getGamepadNavigationTrees) return null;

    const navTrees = DFL.getGamepadNavigationTrees();
    for (const tree of navTrees) {
      try {
        const gridCount = tree.m_window.document.querySelectorAll(
          'div[class="BasicUIContextMenu uWT-cMCXkxiyxcSs9UA-0"]',
        ).length;
        const listCount = tree.m_window.document.querySelectorAll(
          'div[role="menuitem"]',
        ).length;
        if (gridCount > 0 && listCount > 0) {
          cachedWindow = tree.m_window;
          return cachedWindow;
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    log(context, "Error getting Big Picture window:", "error");
  }
  return null;
}

export function startObserving(): void {
  // Ensure we don't leak observers
  stopObserving();

  const bigPicWindow = getBigPictureWindow();

  if (!bigPicWindow) {
    log(context, "Big Picture window not found, retrying...");
    retryTimeout = window.setTimeout(() => {
      retryTimeout = null;
      startObserving();
    }, 1000);
    return;
  }

  // Initial scan
  scanAndBadge();

  // Set up MutationObserver for instant badge injection
  observer = new MutationObserver((mutations) => {
    // Only scan if elements were added
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      debouncedScan();
    }
  });

  const containers = bigPicWindow.document.querySelectorAll(
    'div[role="tabpanel"], div[class*="Panel"]',
  );
  containers.forEach((container) => {
    if (observer) {
      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    }
  });

  if (containers.length > 0) {
    log(context, "Observer attached to containers");
  }

  // Backup: scan every 2 seconds to catch anything missed
  scanInterval = setInterval(scanAndBadge, 2000) as unknown as number;

  // Visibility change listener
  visibilityDocument = bigPicWindow.document;
  visibilityChangeHandler = () => {
    if (!bigPicWindow.document.hidden) {
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      visibilityTimeout = window.setTimeout(() => {
        visibilityTimeout = null;
        scanAndBadge();
      }, 100);
    }
  };
  visibilityDocument.addEventListener(
    "visibilitychange",
    visibilityChangeHandler,
  );
}

export function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout);
    visibilityTimeout = null;
  }
  if (debounceTimeout) {
    cancelAnimationFrame(debounceTimeout);
    debounceTimeout = null;
  }
  if (visibilityDocument && visibilityChangeHandler) {
    visibilityDocument.removeEventListener(
      "visibilitychange",
      visibilityChangeHandler,
    );
  }
  visibilityDocument = null;
  visibilityChangeHandler = null;
}

function scanAndBadge(): void {
  const bigPicWindow = getBigPictureWindow();
  if (!bigPicWindow) return;

  const contexts = 'div[class="BasicUIContextMenu uWT-cMCXkxiyxcSs9UA-0"]';

  const capsules = bigPicWindow.document.querySelectorAll(contexts);
  if (capsules.length > 0){
    log("menu found:", capsules);
  }
}

export function isObserverRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/routes/media")
  );
}