// The marketing site hands its anonymous analytics ID to the dashboard in the
// URL fragment (`#distinct_id=<id>`). We attach it to semantic events so the
// pre-signup journey can be joined to the authenticated user downstream.

const FRAGMENT_PARAM = 'distinct_id';
const STORAGE_KEY = 'estuary.anonymous_id';
const VALID_ID = /^[\w-]{1,200}$/;

let anonymousId: string | null = null;

const readStored = (): string | null => {
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        return stored && VALID_ID.test(stored) ? stored : null;
    } catch {
        return null;
    }
};

const writeStored = (value: string | null) => {
    try {
        if (value) {
            window.sessionStorage.setItem(STORAGE_KEY, value);
        } else {
            window.sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Storage can be blocked; the in-memory copy still covers this page.
    }
};

const decode = (value: string): string | null => {
    try {
        return decodeURIComponent(value.replace(/\+/g, ' '));
    } catch {
        return null;
    }
};

// Reads the handoff ID from the URL fragment, strips it from the address bar,
// and keeps it for the rest of the tab session so it survives auth redirects.
// Other fragment parameters (auth callbacks, etc.) are left byte-for-byte.
export function captureAnonymousId(): string | null {
    if (typeof window === 'undefined') return null;

    const { hash, pathname, search } = window.location;
    const segments = hash.startsWith('#') ? hash.slice(1).split('&') : [];
    const isHandoff = (segment: string) =>
        segment === FRAGMENT_PARAM || segment.startsWith(`${FRAGMENT_PARAM}=`);
    const handoff = segments.find(isHandoff);

    if (handoff === undefined) {
        anonymousId = readStored();
        return anonymousId;
    }

    const remaining = segments.filter((segment) => !isHandoff(segment));
    window.history.replaceState(
        window.history.state,
        '',
        `${pathname}${search}${remaining.length ? `#${remaining.join('&')}` : ''}`
    );

    const value = decode(handoff.slice(FRAGMENT_PARAM.length + 1));
    if (value && VALID_ID.test(value)) {
        // A fresh handoff reflects the most recent marketing visit.
        anonymousId = value;
        writeStored(value);
    } else {
        anonymousId = readStored();
    }

    return anonymousId;
}

export function getAnonymousId(): string | null {
    return anonymousId;
}

// Called on sign out so the next person to use this tab is not linked to the
// previous visitor's marketing activity.
export function clearAnonymousId() {
    anonymousId = null;
    writeStored(null);
}
