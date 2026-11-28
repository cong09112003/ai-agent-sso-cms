import { useEffect, useRef, useState } from 'react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise = null;

// Injects the Google Identity Services script once (no npm package) and resolves with window.google.accounts.id
export const loadGoogleIdentity = () => {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    if (!gsiPromise) {
        gsiPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = GSI_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.google.accounts.id);
            script.onerror = () => {
                gsiPromise = null;
                script.remove();
                reject(new Error('Failed to load Google Identity Services'));
            };
            document.head.appendChild(script);
        });
    }
    return gsiPromise;
};

/**
 * Renders the official icon-only Google button into `containerRef` once `clientId` is known.
 * `onCredential(idToken)` receives the Google ID token (JWT); the caller must keep it in memory only.
 */
const useGoogleIdentity = ({ clientId, active = true, locale, dark, onCredential, containerRef }) => {
    const [ready, setReady] = useState(false);
    const callbackRef = useRef(onCredential);
    callbackRef.current = onCredential;

    useEffect(() => {
        if (!clientId || !active) return undefined;
        let cancelled = false;
        loadGoogleIdentity()
            .then((gid) => {
                if (cancelled || !containerRef.current) return;
                gid.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) callbackRef.current?.(response.credential);
                    },
                });
                containerRef.current.innerHTML = '';
                gid.renderButton(containerRef.current, {
                    type: 'icon',
                    shape: 'circle',
                    size: 'large',
                    theme: dark ? 'filled_black' : 'outline',
                    locale,
                });
                setReady(true);
            })
            .catch(() => {
                // Script blocked (offline / CSP / ad blocker): the Google button just stays hidden
                if (!cancelled) setReady(false);
            });
        return () => {
            cancelled = true;
        };
    }, [clientId, active, locale, dark, containerRef]);

    return { ready };
};

export default useGoogleIdentity;
