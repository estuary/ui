import { graphql } from 'src/gql-types';

// Public query: the API serves legal terms without authentication.
export const LEGAL_TERMS_QUERY = graphql(`
    query LegalTerms($type: LegalTermsType!) {
        legalTerms(type: $type) {
            text
            id
            version
        }
    }
`);

export const LEGAL_TERMS_ACCEPT = graphql(`
    mutation LegalTermsAccept($tenant: String!, $termsId: Id!) {
        legalTermsAccept(tenant: $tenant, termsId: $termsId) {
            id
            text
        }
    }
`);

export const LEGAL_CONSENT_CHECK = graphql(`
    query LegalConsentCheck(
        $tenant: String!
        $type: LegalTermsType!
        $version: LegalConsentVersion!
    ) {
        legalConsentCheck(tenant: $tenant, type: $type, version: $version)
    }
`);
