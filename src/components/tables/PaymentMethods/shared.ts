import type { TableColumns } from 'src/types';

import AmexLogo from 'src/images/payment-methods/amex.png';
import DiscoverLogo from 'src/images/payment-methods/discover.png';
import MastercardLogo from 'src/images/payment-methods/mastercard.png';
import VisaLogo from 'src/images/payment-methods/visa.png';

export const columns: TableColumns[] = [
    {
        field: 'type',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.cardType',
        width: 200,
    },
    {
        field: 'name',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.name',
    },
    {
        field: 'last_four_digits',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.lastFour',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.details',
    },
    {
        field: 'primary',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.primary',
    },
    {
        field: 'actions',
        headerIntlKey: 'admin.billing.paymentMethods.table.label.actions',
    },
];

export const cardLogos: Record<string, string> = {
    amex: AmexLogo,
    discover: DiscoverLogo,
    visa: VisaLogo,
    mastercard: MastercardLogo,
};
