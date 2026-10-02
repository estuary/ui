import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';

const TENANT_CREATE = graphql(`
    mutation TenantCreate(
        $name: String!
        $submittingUserAgreesToTermsId: Id!
        $survey: JSON
    ) {
        tenantCreate(
            name: $name
            submittingUserAgreesToTermsId: $submittingUserAgreesToTermsId
            survey: $survey
        )
    }
`);

export function useTenantCreate() {
    return useMutation(TENANT_CREATE);
}
