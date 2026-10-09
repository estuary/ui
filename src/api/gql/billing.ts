import { graphql } from 'src/gql-types';

export const BILLING_INVOICE_PAGE_SIZE = 100;

// `lineItems` and `extra` are opaque JSON scalars in the schema, so codegen
// types them as `unknown`; the hook casts them to the InvoiceLineItem[] / extra
// shapes the rest of the billing UI already expects. `billed_prefix` is not on
// the node because the tenant is implied by the `tenant(name:)` parent.
export const TENANT_BILLING_INVOICES_QUERY = graphql(`
    query TenantBillingInvoices($tenant: String!, $first: Int, $after: String) {
        tenant(name: $tenant) {
            name
            billing {
                invoices(first: $first, after: $after) {
                    edges {
                        node {
                            dateStart
                            dateEnd
                            invoiceType
                            subtotal
                            lineItems
                            extra
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
            name
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
            name
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

// `none` returns every prefix the user can reach, with its capability bits.
// Billing access is checked against the bits rather than the legacy
// read/write/admin level, which no longer says whether a grant includes
// ViewBilling or EditBilling.
export const BILLING_CAPABILITIES_QUERY = graphql(`
    query BillingCapabilities($after: String) {
        prefixes(by: { minCapability: none }, first: 7500, after: $after) {
            edges {
                node {
                    prefix
                    capabilities
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`);
