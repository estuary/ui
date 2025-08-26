import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import useSWR from 'swr';

import { getAllStorageMappingStores } from 'src/api/storageMappings';
import { singleCallSettings } from 'src/context/SWR';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { stripPathing } from 'src/utils/misc-utils';

// TODO (Entities Store)
// We should move away from hardcoded hooks and just pass in the capability
//  we are looking for. So a single hook takes in `read`, `write`, `admin` (maybe even an array of these?)
//  and returns the needed entities.
//  I think there is a chance we could use some kind of permissions library to help with this.

export const useEntitiesStore_capabilities_readable = () => {
    return useEntitiesStore(
        useShallow((state) => [
            ...new Set([
                ...state.capabilities.admin,
                ...state.capabilities.write,
                ...state.capabilities.read,
            ]),
        ])
    );
};

export const useEntitiesStore_capabilities_writable = () => {
    return useEntitiesStore(
        useShallow((state) => [
            ...new Set([
                ...state.capabilities.admin,
                ...state.capabilities.write,
            ]),
        ])
    );
};

export const useEntitiesStore_atLeastOneAdminTenant = () => {
    return useEntitiesStore(
        useShallow((state) => state.capabilities.admin.length > 0)
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
            if (!restrictByStorageMappings || hasSupportRole) {
                return state.capabilities.admin;
            }

            return Object.keys(state.storageMappings).filter(
                (storageMappingPrefix) =>
                    state.capabilities.admin.some((adminPrefix) =>
                        storageMappingPrefix.startsWith(adminPrefix)
                    )
            );
        })
    );
};

export const useEntitiesStore_tenantsWithAdmin = () => {
    return useEntitiesStore(
        useShallow((state) => [
            ...new Set(
                state.capabilities.admin.map((tenant) =>
                    stripPathing(tenant, true)
                )
            ),
        ])
    );
};

export const useHydrateState = () => {
    const [
        hydrateState,
        setActive,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ] = useEntitiesStore((state) => [
        state.hydrateState,
        state.setActive,
        state.setCapabilities,
        state.setHydrated,
        state.setHydrationErrors,
        state.setMutate,
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
            setHydrationErrors(response.data?.error);
            setCapabilities(response.data?.data ?? null);
            setMutate(response.mutate);
            setHydrated(true);
        }
    }, [
        response.data?.data,
        response.data?.error,
        response.isValidating,
        response.mutate,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ]);

    return response;
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
