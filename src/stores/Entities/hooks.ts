import type { PostgrestError } from '@supabase/postgrest-js';
import type { EntitiesState } from 'src/stores/Entities/types';
import type { AuthRoles, Capability } from 'src/types';
import type {
    AuthRolesQueryResponse,
    PaginationVariables,
} from 'src/types/gql';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import useSWR from 'swr';
import { gql, useQuery } from 'urql';

import { getAllStorageMappingStores } from 'src/api/storageMappings';
import { singleCallSettings } from 'src/context/SWR';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { stripPathing } from 'src/utils/misc-utils';

// TODO (Entities Store)
// We should move away from hardcoded hooks and just pass in the capability
//  we are looking for. So a single hook takes in `read`, `write`, `admin` (maybe even an array of these?)
//  and returns the needed entities.
//  I think there is a chance we could use some kind of permissions library to help with this.

export const useEntitiesStore_capabilities_readable = () => {
    return useEntitiesStore(
        useShallow((state) =>
            Array.from(
                new Set([
                    ...state.capabilities.admin,
                    ...state.capabilities.write,
                    ...state.capabilities.read,
                ])
            )
        )
    );
};

export const useEntitiesStore_capabilities_writable = () => {
    return useEntitiesStore(
        useShallow((state) =>
            Array.from(
                new Set([
                    ...state.capabilities.admin,
                    ...state.capabilities.write,
                ])
            )
        )
    );
};

export const useEntitiesStore_atLeastOneAdminTenant = () => {
    return useEntitiesStore(
        useShallow((state) => state.capabilities.admin.size > 0)
    );
};

export const useEntitiesStore_capabilities_adminable = (
    restrictByStorageMappings?: boolean
) => {
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );
    return useEntitiesStore(
        useShallow((state) => {
            const adminCapabilities = Array.from(state.capabilities.admin);

            if (!restrictByStorageMappings || hasSupportRole) {
                return adminCapabilities;
            }

            return Object.keys(state.storageMappings).filter(
                (storageMappingPrefix) =>
                    adminCapabilities.some((adminPrefix) =>
                        storageMappingPrefix.startsWith(adminPrefix)
                    )
            );
        })
    );
};

export const useEntitiesStore_tenantsWithAdmin = () => {
    return useEntitiesStore(
        useShallow((state) => {
            const tenants = new Set<string>();

            state.capabilities.admin.forEach((datum) => {
                tenants.add(stripPathing(datum, true));
            });

            return Array.from(tenants);
        })
    );
};

export const useEntitiesStore_populateState = () => {
    const [setCapabilities, setHydrated, setHydrationErrors, setMutate] =
        useEntitiesStore(
            useShallow((state) => [
                state.setCapabilities,
                state.setHydrated,
                state.setHydrationErrors,
                state.setMutate,
            ])
        );

    const populateState = useCallback(
        ({
            data,
            error,
            mutate,
        }: {
            data: (AuthRoles | null)[] | null;
            mutate: EntitiesState['mutate'];
            error?: PostgrestError | null;
        }) => {
            setCapabilities(data);
            setHydrationErrors(error);
            setMutate(mutate);
            setHydrated(true);
        },
        [setCapabilities, setHydrated, setHydrationErrors, setMutate]
    );

    return {
        populateState,
    };
};

// The 7500 was kind of picked through "vibes"
//  It should keep the payload around 1000kB
//  That should load in around 1 second for 4g
const authRolesQuery = gql<AuthRolesQueryResponse, PaginationVariables>`
    query AuthRolesQuery($after: String) {
        prefixes(by: { minCapability: read }, first: 7500, after: $after) {
            edges {
                node {
                    prefix
                    userCapability
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export const useHydrateStateWithGql = () => {
    const { populateState } = useEntitiesStore_populateState();

    // Store all data so we can pretend we didn't paginate through
    const allDataRef = useRef<Set<AuthRoles>>(new Set());
    const isComplete = useRef(false);
    const [after, setAfter] = useState<string | undefined>(undefined);

    const [{ fetching, data, error }] = useQuery({
        query: authRolesQuery,
        variables: { after },
    });

    useEffect(() => {
        if (isComplete.current || fetching) {
            return;
        }

        (data?.prefixes?.edges ?? []).forEach(({ node }) => {
            allDataRef.current.add({
                capability: node.userCapability as Capability,
                role_prefix: node.prefix,
            });
        });

        const endCursor = data?.prefixes?.pageInfo?.endCursor;
        if (
            // Stop if there are errors and just show error to user
            !Boolean(error) &&
            data?.prefixes?.pageInfo?.hasNextPage &&
            endCursor
        ) {
            setAfter(endCursor);
        } else {
            // We are done - set so we stop any other effects from running right away
            isComplete.current = true;

            logRocketEvent('authroles', {
                totalFetched: allDataRef.current.size,
                usedGql: true,
            });

            populateState({
                data: Array.from(allDataRef.current),
                error: error
                    ? {
                          ...BASE_ERROR,
                          message: error.message,
                      }
                    : null,
                mutate: () => {
                    // TODO (gql auth roles) - see GRAPHQL.md
                    logRocketEvent('authroles', {
                        mutate: true,
                        usedGql: true,
                    });

                    return Promise.resolve();
                },
            });
        }
    }, [data, error, fetching, populateState]);
};

export const useHydrateStateWithPostgres = () => {
    const { populateState } = useEntitiesStore_populateState();

    const [hydrateState, setActive] = useEntitiesStore(
        useShallow((state) => [state.hydrateState, state.setActive])
    );

    // We hardcode the key here as we only call once
    const response = useSWR(
        'entities_hydrator',
        () => {
            setActive(true);
            return hydrateState();
        },
        singleCallSettings
    );

    // Once we are done validating update all the settings
    useEffect(() => {
        if (!response.isValidating) {
            populateState({
                data: response.data?.data ?? null,
                error: response.data?.error,
                mutate: response.mutate ?? null,
            });
        }
    }, [
        populateState,
        response.data?.data,
        response.data?.error,
        response.isValidating,
        response.mutate,
    ]);
};

export const useStorageMappingsHydrator = () => {
    const [hydrated, setStorageMappings] = useEntitiesStore(
        useShallow((state) => [state.hydrated, state.setStorageMappings])
    );

    // We do not want to get these for support role as that will time out
    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    // We hardcode the key here as we only call once
    const storageMappingResponse = useSWR(
        `entities_hydrator:storage_mappings`,
        hasSupportRole
            ? null
            : () => {
                  return getAllStorageMappingStores();
              },
        singleCallSettings
    );

    // Once we are done validating update all the settings
    useEffect(() => {
        if (hydrated && !storageMappingResponse.isValidating) {
            // TODO (data planes) - need to filter these down to those that are admin-able
            setStorageMappings(storageMappingResponse.data?.data as any);
        }
    }, [
        hydrated,
        setStorageMappings,
        storageMappingResponse.data?.data,
        storageMappingResponse.data?.error,
        storageMappingResponse.isValidating,
    ]);

    return storageMappingResponse;
};
