import { useMutation } from 'urql';

import { graphql } from 'src/gql-types';

const TENANT_CREATE = graphql(`
    mutation TenantCreate($input: TenantCreateInput!) {
        tenantCreate(input: $input)
    }
`);

export function useTenantCreate() {
    return useMutation(TENANT_CREATE);
}
