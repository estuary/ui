import { graphql } from 'src/gql-types';

// The filter's dates are exclusive.
export const TENANT_BILLING_INVOICES_QUERY = graphql(`
    query TenantBillingInvoices(
        $tenant: String!
        $filter: InvoiceFilter
        $first: Int
        $after: String
        $withStripe: Boolean!
    ) {
        tenant(name: $tenant) {
            billing {
                invoices(filter: $filter, first: $first, after: $after) {
                    edges {
                        node {
                            dateStart
                            dateEnd
                            invoiceType
                            subtotal
                            lineItems
                            extra
                            status @include(if: $withStripe)
                            invoicePdf @include(if: $withStripe)
                            hostedInvoiceUrl @include(if: $withStripe)
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }
        }
    }
`);

export const BILLING_HISTORY_PAGE_SIZE = 4;

// Only card or usBankAccount is populated; last4 remains a zero-padded string.
graphql(`
    fragment BillingPaymentMethodFields on PaymentMethod {
        id
        type
        billingDetails {
            name
        }
        card {
            brand
            last4
            expMonth
            expYear
        }
        usBankAccount {
            bankName
            last4
        }
    }
`);

export const TENANT_BILLING_PAYMENT_METHODS_QUERY = graphql(`
    query TenantBillingPaymentMethods($tenant: String!) {
        tenant(name: $tenant) {
            billing {
                primaryPaymentMethod {
                    id
                }
                paymentMethods {
                    ...BillingPaymentMethodFields
                }
            }
        }
    }
`);

export const CREATE_BILLING_SETUP_INTENT = graphql(`
    mutation CreateBillingSetupIntent($tenant: String!) {
        createBillingSetupIntent(tenant: $tenant) {
            clientSecret
        }
    }
`);

export const SET_BILLING_PAYMENT_METHOD = graphql(`
    mutation SetBillingPaymentMethod(
        $tenant: String!
        $paymentMethodId: String!
    ) {
        setBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
            paymentMethods {
                ...BillingPaymentMethodFields
            }
        }
    }
`);

export const DELETE_BILLING_PAYMENT_METHOD = graphql(`
    mutation DeleteBillingPaymentMethod(
        $tenant: String!
        $paymentMethodId: String!
    ) {
        deleteBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
            paymentMethods {
                ...BillingPaymentMethodFields
            }
        }
    }
`);

// Only registers the fragment with codegen. The contact query and mutation
// share it so `setBillingContact` returns the fields its cache update writes.
graphql(`
    fragment BillingContactFields on BillingContact {
        name
        email
        address {
            line1
            line2
            city
            state
            postalCode
            country
        }
    }
`);

export const TENANT_BILLING_CONTACT_QUERY = graphql(`
    query TenantBillingContact($tenant: String!) {
        tenant(name: $tenant) {
            billing {
                contact {
                    ...BillingContactFields
                }
            }
        }
    }
`);

export const SET_BILLING_CONTACT = graphql(`
    mutation SetBillingContact(
        $tenant: String!
        $name: String!
        $email: String!
        $address: BillingAddressInput!
    ) {
        setBillingContact(
            tenant: $tenant
            name: $name
            email: $email
            address: $address
        ) {
            contact {
                ...BillingContactFields
            }
        }
    }
`);

// Billing is checked against the capability bits rather than the legacy
// read/write/admin level, which no longer says whether a grant includes
// ViewBilling or EditBilling. `none` keeps grants that carry only bits, and
// the `in` filter returns just the row at the tenant itself.
export const BILLING_CAPABILITIES_QUERY = graphql(`
    query BillingCapabilities($tenant: String!) {
        prefixes(
            by: { minCapability: none }
            filter: { prefix: { in: [$tenant] } }
        ) {
            edges {
                node {
                    capabilities
                }
            }
        }
    }
`);
