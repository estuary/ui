import { graphql } from 'src/gql-types';

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
