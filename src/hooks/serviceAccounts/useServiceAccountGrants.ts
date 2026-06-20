import type {
    ServiceAccountGrant,
    ServiceAccountGrantRow,
} from 'src/api/combinedGrantsExt';

import useSWR from 'swr';

import {
    catalogNameFromServiceAccountEmail,
    getServiceAccountGrants,
    getServiceAccountGrantsByNames,
} from 'src/api/combinedGrantsExt';

const EMPTY_GRANTS: ServiceAccountGrant[] = [];
const EMPTY_GRANTS_BY_NAME: Record<string, ServiceAccountGrant[]> = {};

// Grants for a single service account (detail screen). The returned `mutate`
// lets callers revalidate after adding, editing, or removing a grant.
export function useServiceAccountGrants(catalogName: string | null) {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        catalogName ? ['service-account-grants', catalogName] : null,
        async () => {
            const { data: rows, error: queryError } =
                await getServiceAccountGrants(catalogName as string);

            if (queryError) {
                throw queryError;
            }

            return rows ?? EMPTY_GRANTS;
        }
    );

    return {
        grants: data ?? EMPTY_GRANTS,
        error,
        fetching: isLoading,
        isValidating,
        mutate,
    };
}

// Grants for every account visible on the list page, fetched in one query and
// grouped by the account catalog name (subject_role).
export function useServiceAccountGrantsByNames(catalogNames: string[]) {
    const sortedNames = [...catalogNames].sort();

    const { data, error, isLoading, mutate } = useSWR(
        sortedNames.length
            ? ['service-account-grants-batch', ...sortedNames]
            : null,
        async () => {
            const { data: rows, error: queryError } =
                await getServiceAccountGrantsByNames(catalogNames);

            if (queryError) {
                throw queryError;
            }

            return (rows ?? []).reduce<Record<string, ServiceAccountGrant[]>>(
                (grouped, row: ServiceAccountGrantRow) => {
                    const { user_email, ...grant } = row;
                    const catalogName =
                        catalogNameFromServiceAccountEmail(user_email);
                    (grouped[catalogName] ??= []).push(grant);
                    return grouped;
                },
                {}
            );
        }
    );

    return {
        grantsByName: data ?? EMPTY_GRANTS_BY_NAME,
        error,
        fetching: isLoading,
        mutate,
    };
}
