import { describe, expect, test } from 'vitest';

import {
    formatAddress,
    fromStripeAddress,
    getContactStatus,
    getMissingContactFields,
    toStripeAddress,
    validateBillingEmail,
} from 'src/utils/billing-contact-utils';

const usAddress = {
    line1: '500 Howard St',
    line2: null,
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
};
const contact = {
    name: 'Acme Corp',
    email: 'billing@acme.co',
    address: usAddress,
};

describe('getMissingContactFields', () => {
    test('lists the required fields that are empty', () => {
        expect(getMissingContactFields(null)).toEqual([
            'organization name',
            'billing email',
            'country or region',
            'address line 1',
        ]);
        expect(getMissingContactFields(contact)).toEqual([]);
    });

    test('treats whitespace as missing', () => {
        expect(
            getMissingContactFields({
                name: ' ',
                email: '\t',
                address: { ...usAddress, line1: '  ' },
            })
        ).toEqual(['organization name', 'billing email', 'address line 1']);
    });
});

test('getContactStatus distinguishes missing, incomplete and complete', () => {
    expect(getContactStatus(undefined)).toBe('missing');
    expect(
        getContactStatus({ name: ' ', email: '', address: { line1: ' ' } })
    ).toBe('missing');
    expect(
        getContactStatus({ name: null, email: null, address: usAddress })
    ).toBe('incomplete');
    expect(getContactStatus(contact)).toBe('complete');
});

describe('formatAddress', () => {
    test('formats a US address with the country name', () => {
        expect(formatAddress(usAddress)).toBe(
            '500 Howard St, San Francisco, CA 94105, United States'
        );
    });

    test('skips blank parts and trims each line', () => {
        expect(
            formatAddress({
                line1: ' 10 Downing St ',
                line2: 'Flat 2',
                city: 'London',
                state: ' ',
                postalCode: 'SW1A 2AA',
                country: ' GB ',
            })
        ).toBe('10 Downing St, Flat 2, London SW1A 2AA, United Kingdom');
    });

    test('falls back to the raw country value when it is not a region code', () => {
        expect(formatAddress({ country: 'USA' })).toBe('USA');
    });
});

describe('Stripe address conversion', () => {
    test('toStripeAddress trims values and fills blanks with empty strings', () => {
        expect(
            toStripeAddress({
                line1: ' 500 Howard St ',
                line2: null,
                city: 'San Francisco ',
                postalCode: ' 94105',
                country: 'US',
            })
        ).toEqual({
            line1: '500 Howard St',
            line2: '',
            city: 'San Francisco',
            state: '',
            postal_code: '94105',
            country: 'US',
        });
        // A new tenant has no address yet.
        expect(toStripeAddress(null)).toEqual({
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
        });
    });

    test('fromStripeAddress trims values and turns blanks into null', () => {
        expect(
            fromStripeAddress({
                line1: ' 1 Main St ',
                line2: '  ',
                city: 'Austin',
                state: null,
                postal_code: ' 78701 ',
                country: 'US',
            })
        ).toEqual({
            line1: '1 Main St',
            line2: null,
            city: 'Austin',
            state: null,
            postalCode: '78701',
            country: 'US',
        });
    });
});

describe('validateBillingEmail', () => {
    test.each(['  billing@acme.co  ', 'a.b+c@sub.acme.io'])(
        'accepts %j',
        (email) => {
            expect(validateBillingEmail(email)).toBeNull();
        }
    );

    test.each([
        ['   ', 'Enter a billing email'],
        [
            'a@acme.co, b@acme.co',
            'Enter one valid email, like billing@company.com',
        ],
        [
            'a@acme.co;b@acme.co',
            'Enter one valid email, like billing@company.com',
        ],
        ['a b@acme.co', 'Enter one valid email, like billing@company.com'],
        ['a@b', 'Enter one valid email, like billing@company.com'],
        ['a@b.c', 'Enter one valid email, like billing@company.com'],
        ['@acme.co', 'Enter one valid email, like billing@company.com'],
    ])('rejects %j', (email, message) => {
        expect(validateBillingEmail(email)).toBe(message);
    });
});
