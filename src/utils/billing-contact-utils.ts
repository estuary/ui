import type {
    BillingAddress,
    BillingAddressInput,
    BillingContactFieldsFragment,
} from 'src/gql-types/graphql';

export type BillingContact = BillingContactFieldsFragment;
type BillingContactStatus = 'missing' | 'incomplete' | 'complete';

// Stripe's address form, in the shape its elements and billing_details use.
export interface StripeAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

const hasValue = (value: string | null | undefined) => Boolean(value?.trim());

// The fields a payment method's billing details need, named as in Stripe's
// form. Stripe applies each country's other rules when the contact is entered.
export function getMissingContactFields(
    contact: BillingContact | null | undefined
): string[] {
    const address = contact?.address;
    const fields: [string, string | null | undefined][] = [
        ['organization name', contact?.name],
        ['billing email', contact?.email],
        ['country or region', address?.country],
        ['address line 1', address?.line1],
    ];

    return fields
        .filter(([, value]) => !hasValue(value))
        .map(([label]) => label);
}

export function getContactStatus(
    contact: BillingContact | null | undefined
): BillingContactStatus {
    const address = contact?.address;
    const anyValue = [
        contact?.name,
        contact?.email,
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postalCode,
        address?.country,
    ].some(hasValue);

    if (!anyValue) {
        return 'missing';
    }

    return getMissingContactFields(contact).length > 0
        ? 'incomplete'
        : 'complete';
}

// One line, as on an invoice: "500 Howard St, San Francisco, CA 94105, United States".
export function formatAddress(address: BillingAddress | null | undefined) {
    if (!address) {
        return '';
    }

    const locality = [address.city, address.state].filter(hasValue).join(', ');
    const cityLine = [locality, address.postalCode].filter(hasValue).join(' ');
    let country = address.country?.trim() ?? '';
    try {
        country =
            new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ??
            country;
    } catch {
        // Not a region code, so show it as saved.
    }

    return [address.line1, address.line2, cityLine, country]
        .map((line) => line?.trim() ?? '')
        .filter(Boolean)
        .join(', ');
}

export const toStripeAddress = (
    address: BillingAddress | null | undefined
): StripeAddress => ({
    line1: address?.line1?.trim() ?? '',
    line2: address?.line2?.trim() ?? '',
    city: address?.city?.trim() ?? '',
    state: address?.state?.trim() ?? '',
    postal_code: address?.postalCode?.trim() ?? '',
    country: address?.country?.trim() ?? '',
});

const orNull = (value: string | null | undefined) => value?.trim() || null;

export const fromStripeAddress = (address: {
    [Field in keyof StripeAddress]?: string | null;
}): BillingAddressInput => ({
    line1: orNull(address.line1),
    line2: orNull(address.line2),
    city: orNull(address.city),
    state: orNull(address.state),
    postalCode: orNull(address.postal_code),
    country: orNull(address.country),
});

// The server only checks for an "@". Stripe also rejects lists of addresses
// and addresses without a domain.
export function validateBillingEmail(email: string): string | null {
    const value = email.trim();

    if (!value) {
        return 'Enter a billing email';
    }

    return /^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]{2,}$/.test(value)
        ? null
        : 'Enter one valid email, like billing@company.com';
}
