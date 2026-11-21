import type { BillingPaymentMethodFieldsFragment } from 'src/gql-types/graphql';

const CARD_BRANDS: Record<string, string> = {
    amex: 'American Express',
    diners: 'Diners Club',
    discover: 'Discover',
    jcb: 'JCB',
    mastercard: 'Mastercard',
    unionpay: 'UnionPay',
    visa: 'Visa',
};

const cardBrandName = (brand: string | null | undefined) =>
    CARD_BRANDS[brand ?? ''] ?? 'Card';

// The tenant's primary payment method, or its only one when none is primary.
export const primaryPaymentMethod = (
    billing:
        | {
              primaryPaymentMethod?: { id: string } | null;
              paymentMethods: BillingPaymentMethodFieldsFragment[];
          }
        | undefined
) =>
    billing?.paymentMethods.find(
        ({ id }) => id === billing.primaryPaymentMethod?.id
    ) ??
    (billing?.paymentMethods.length === 1
        ? billing.paymentMethods[0]
        : undefined);

// The card's brand or the account's bank, and the last digits of its number.
export const describePaymentMethod = ({
    card,
    usBankAccount,
    type,
}: BillingPaymentMethodFieldsFragment) =>
    card
        ? { name: cardBrandName(card.brand), last4: card.last4 }
        : {
              name: usBankAccount?.bankName ?? type.replaceAll('_', ' '),
              last4: usBankAccount?.last4,
          };

// "Visa ending 4242"
export function paymentMethodLabel(method: BillingPaymentMethodFieldsFragment) {
    const { name, last4 } = describePaymentMethod(method);

    return last4 ? `${name} ending ${last4}` : name;
}
