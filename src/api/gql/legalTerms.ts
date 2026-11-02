import { graphql } from 'src/gql-types';

export const LEGAL_TERMS_TYPES = graphql(`
    query LegalTermsTypes {
        __type(name: "LegalTermsType") {
            enumValues {
                name
            }
        }
    }
`);

// Public query: the API serves legal terms without authentication.
export const LEGAL_TERMS = graphql(`
    query LegalTerms($type: LegalTermsType!) {
        legalTerms(type: $type) {
            text
            id
            version
        }
    }
`);

export const LEGAL_ACCEPT = graphql(`
    mutation LegalAccept($tenant: String!, $termsId: Id!) {
        legalAccept(tenant: $tenant, termsId: $termsId) {
            id
        }
    }
`);

export const LEGAL_CHECK = graphql(`
    query LegalCheck(
        $tenant: String!
        $type: LegalTermsType!
        $version: LegalConsentVersion!
    ) {
        legalCheck(tenant: $tenant, type: $type, version: $version)
    }
`);
