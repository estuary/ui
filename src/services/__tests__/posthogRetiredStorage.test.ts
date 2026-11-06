import {
    cookieDomains,
    purgeRetiredPostHogStorage,
} from 'src/services/posthogRetiredStorage';

const RETIRED = 'phc_retired';
const CURRENT = 'phc_current';

describe('cookieDomains', () => {
    test('lists the host and each parent domain', () => {
        expect(cookieDomains('dashboard.estuary.dev')).toEqual([
            'dashboard.estuary.dev',
            'estuary.dev',
        ]);
    });

    test('handles a single-label host', () => {
        expect(cookieDomains('localhost')).toEqual([]);
    });
});

// Node's own Web Storage globals can shadow jsdom's, so tests bring their own
class MemoryStorage implements Storage {
    private items = new Map<string, string>();

    get length() {
        return this.items.size;
    }

    clear() {
        this.items.clear();
    }

    getItem(key: string) {
        return this.items.get(key) ?? null;
    }

    key(index: number) {
        return [...this.items.keys()][index] ?? null;
    }

    removeItem(key: string) {
        this.items.delete(key);
    }

    setItem(key: string, value: string) {
        this.items.set(key, value);
    }
}

describe('purgeRetiredPostHogStorage', () => {
    const cookieWrites: string[] = [];
    beforeEach(() => {
        cookieWrites.length = 0;
        vi.stubGlobal('localStorage', new MemoryStorage());
        vi.stubGlobal('sessionStorage', new MemoryStorage());

        vi.spyOn(document, 'cookie', 'get').mockReturnValue(
            `ph_${RETIRED}_posthog=%7B%7D; ph_${CURRENT}_posthog=%7B%7D; other=1`
        );
        vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
            cookieWrites.push(value);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('expires only cookies for retired tokens', () => {
        purgeRetiredPostHogStorage([RETIRED]);

        expect(cookieWrites.length).toBeGreaterThan(0);
        cookieWrites.forEach((write) => {
            expect(write.startsWith(`ph_${RETIRED}_posthog=;`)).toBe(true);
            expect(write).toContain('Max-Age=0');
        });
    });

    test('removes storage keys for retired tokens only', () => {
        window.localStorage.setItem(`ph_${RETIRED}_posthog`, '{}');
        window.localStorage.setItem(`ph_${CURRENT}_posthog`, '{}');
        window.sessionStorage.setItem(`ph_${RETIRED}_window_id`, 'x');
        window.localStorage.setItem('unrelated', '1');

        purgeRetiredPostHogStorage([RETIRED]);

        expect(window.localStorage.getItem(`ph_${RETIRED}_posthog`)).toBeNull();
        expect(
            window.sessionStorage.getItem(`ph_${RETIRED}_window_id`)
        ).toBeNull();
        expect(window.localStorage.getItem(`ph_${CURRENT}_posthog`)).toBe('{}');
        expect(window.localStorage.getItem('unrelated')).toBe('1');
    });

    test('does nothing without retired tokens', () => {
        window.localStorage.setItem(`ph_${RETIRED}_posthog`, '{}');

        purgeRetiredPostHogStorage([]);

        expect(cookieWrites).toEqual([]);
        expect(window.localStorage.getItem(`ph_${RETIRED}_posthog`)).toBe('{}');
    });
});
