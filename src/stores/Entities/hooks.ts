import { singleCallSettings } from 'context/SWR';
import { useEffect } from 'react';
import useSWR from 'swr';
import { stripPathing } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';
import { useEntitiesStore } from './Store';

// TODO (Entities Store)
// We should move away from hardcoded hooks and just pass in the capability
//  we are looking for. So a single hook takes in `read`, `write`, `admin` (maybe even an array of these?)
//  and returns the needed entities.
//  I think there is a chance we could use some kind of permissions library to help with this.

export const useEntitiesStore_capabilities_readable = () => {
    return useEntitiesStore(
        useShallow((state) =>
            Object.keys({
                ...state.capabilities.admin,
                ...state.capabilities.write,
                ...state.capabilities.read,
            })
        )
    );
};

// Not being used right now but commenting out to make the pattern more clear
// export const useEntitiesStore_capabilities_writable = () => {
//     return useEntitiesStore(
//         useShallow((state) => {
//             return {
//                 ...state.capabilities.admin,
//                 ...state.capabilities.write,
//             };
//         })
//     );
// };

export const useEntitiesStore_capabilities_adminable = () => {
    return useEntitiesStore(
        useShallow((state) => Object.keys(state.capabilities.admin))
    );
};

export const useEntitiesStore_tenantsWithAdmin = () => {
    return useEntitiesStore(
        useShallow((state) => [
            ...new Set(
                Object.keys(state.capabilities.admin).map((tenant) =>
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
