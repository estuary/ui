import { gql } from 'urql';

export const PAGE_INFO_REVERSE_FRAGMENT = gql`
    fragment PageInfoReverse on PageInfo {
        hasPreviousPage
        startCursor
        endCursor
    }
`;

export const ERROR_MESSAGES = {
    unauthorized: '[Network] Unauthorized',
};

export const tokenHasIssues_GQL = (errorMessage?: string) => {
    return errorMessage && errorMessage === ERROR_MESSAGES.unauthorized;
};
