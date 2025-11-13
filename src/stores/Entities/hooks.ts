import type { AuthRoles, Capability } from 'src/types';
import type { AuthRolesQueryResponse } from 'src/types/gql';

import { useCallback, useEffect } from 'react';

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

export const useEntitiesHydrationStatePopulate = () => {
    const [setCapabilities, setHydrated, setHydrationErrors, setMutate] =
        useEntitiesStore((state) => [
            state.setCapabilities,
            state.setHydrated,
            state.setHydrationErrors,
            state.setMutate,
        ]);

    const populateState = useCallback(
        ({
            data,
            error,
            mutate,
        }: {
            data: (AuthRoles | null)[] | null;
            error: any;
            mutate: any;
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

const authRolesQuery = gql<AuthRolesQueryResponse>`
    query AuthRolesQuery {
        prefixes(by: { minCapability: read }, first: 25000) {
            edges {
                cursor
                node {
                    prefix
                    userCapability
                }
            }
        }
    }
`;
export const useHydrateStateWithGql = () => {
    const { populateState } = useEntitiesHydrationStatePopulate();

    // We hardcode the key here as we only call once
    const [{ fetching, data, error }, reexecuteQuery] = useQuery({
        query: authRolesQuery,
    });

    console.log('useHydrateStateWithGql', fetching);

    // Once we are done validating update all the settings
    useEffect(() => {
        if (!fetching) {
            logRocketEvent('authroles', {
                fetching: true,
                usedGql: true,
            });

            populateState({
                data:
                    data?.prefixes?.edges?.map(({ node }) => {
                        return {
                            capability: node.userCapability as Capability,
                            role_prefix: node.prefix,
                        };
                    }) ?? [],
                error: error
                    ? {
                          ...BASE_ERROR,
                          message: error.message,
                      }
                    : null,
                mutate: reexecuteQuery ?? null,
            });
        }
    }, [data?.prefixes?.edges, error, fetching, populateState, reexecuteQuery]);
};

export const useHydrateStateWithPostgres = () => {
    const { populateState } = useEntitiesHydrationStatePopulate();

    const [hydrateState, setActive] = useEntitiesStore((state) => [
        state.hydrateState,
        state.setActive,
    ]);

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
    const [hydrated, setStorageMappings] = useEntitiesStore((state) => [
        state.hydrated,
        state.setStorageMappings,
    ]);

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
