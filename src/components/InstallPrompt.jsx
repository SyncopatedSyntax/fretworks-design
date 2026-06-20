// Single "Add to Home Screen" prompt for the whole PWA. Rendered ONLY by the
// shell (one origin = one install). Captures Android's beforeinstallprompt and
// shows an iOS Safari hint as a fallback. Dismissal is remembered.
import { useEffect, useState } from "react";

const DISMISS_KEY = "fw_install_dismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {}

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    let t;
    if (isIOS()) {
      t = setTimeout(() => {
        setIosHint(true);
        setShow(true);
      }, 2500);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (t) clearTimeout(t);
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="fw-install" role="dialog" aria-label="Install Fretworks">
      <button className="fw-install-close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
      {iosHint ? (
        <p className="fw-install-text">
          Install Fretworks: tap <b>Share</b> then <b>Add to Home Screen</b>.
        </p>
      ) : (
        <>
          <p className="fw-install-text">Install Fretworks for offline practice.</p>
          <button className="fw-btn fw-btn-primary fw-install-btn" onClick={install}>
            Add to Home Screen
          </button>
        </>
      )}
    </div>
  );
}
