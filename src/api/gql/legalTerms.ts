import { graphql } from 'src/gql-types';

// Public query: the API serves legal terms without authentication.
export const LEGAL_TERMS_QUERY = graphql(`
    query LegalTerms($type: LegalTermsType!) {
        legalTerms(type: $type) {
            text
            id
        }
    }
`);

// Consent checks need the version; public terms and signup use the query above.
export const LEGAL_CONSENT_TERMS_QUERY = graphql(`
    query LegalConsentTerms($type: LegalTermsType!) {
        legalTerms(type: $type) {
            text
            id
            version
        }
    }
`);

export const LEGAL_TERMS_ACCEPT = graphql(`
    mutation LegalTermsAccept($tenant: String!, $termsId: Id!) {
        legalAccept(tenant: $tenant, termsId: $termsId) {
            id
        }
    }
`);

export const LEGAL_CONSENT_CHECK = graphql(`
    query LegalConsentCheck(
        $tenant: String!
        $type: LegalTermsType!
        $version: LegalConsentVersion!
    ) {
        legalCheck(tenant: $tenant, type: $type, version: $version)
    }
`);
