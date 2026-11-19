import { beforeEach, describe, expect, it } from 'vitest';

import {
    captureAnonymousId,
    clearAnonymousId,
    getAnonymousId,
} from 'src/services/anonymousId';

const ID = '019a2b3c-4d5e-7f00-8a9b-0c1d2e3f4a5b';

const visit = (url: string) => window.history.replaceState(null, '', url);

beforeEach(() => {
    clearAnonymousId();
    visit('/');
});

describe('anonymous id handoff', () => {
    it('captures the id and removes it from the URL', () => {
        visit(`/register?plan=free#distinct_id=${ID}`);

        expect(captureAnonymousId()).toBe(ID);
        expect(getAnonymousId()).toBe(ID);
        expect(window.location.pathname).toBe('/register');
        expect(window.location.search).toBe('?plan=free');
        expect(window.location.hash).toBe('');
    });

    it('leaves other fragment parameters untouched', () => {
        visit(`/auth#access_token=a%2Bb&distinct_id=${ID}&type=signup`);

        captureAnonymousId();

        expect(window.location.hash).toBe('#access_token=a%2Bb&type=signup');
    });

    it('restores the id on a later page load in the same tab', () => {
        visit(`/register#distinct_id=${ID}`);
        captureAnonymousId();

        // e.g. returning from an auth provider redirect
        visit('/welcome');

        expect(captureAnonymousId()).toBe(ID);
    });

    it('strips but does not keep an invalid id', () => {
        visit('/register#distinct_id=%3Cscript%3E');

        expect(captureAnonymousId()).toBeNull();
        expect(window.location.hash).toBe('');
    });

    it('does not touch the URL when there is no handoff', () => {
        visit('/register#section');

        expect(captureAnonymousId()).toBeNull();
        expect(window.location.hash).toBe('#section');
    });

    it('forgets the id when cleared', () => {
        visit(`/register#distinct_id=${ID}`);
        captureAnonymousId();

        clearAnonymousId();
        visit('/login');

        expect(captureAnonymousId()).toBeNull();
        expect(getAnonymousId()).toBeNull();
    });
});
