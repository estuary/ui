import { useMemo } from 'react';
import { useBinding_hydrated } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEndpointConfig_hydrated } from 'stores/EndpointConfig/hooks';

// TODO (forms)
// Later on we might want to build this out in a way where forms can
//  basically "register" with the submit button and then inform it when
//  they are done loading, invalid, etc.

// This checks the main 3 forms that are always there. This does not cover
//  every use case so some things might slip through - but it is way better
//  than not checking any of this stuff.
function useEntityWorkflowHydrated() {
    const bindingsHydrated = useBinding_hydrated();
    const detailsHydrated = useDetailsFormStore((state) => state.hydrated);
    const endpointHydrated = useEndpointConfig_hydrated();

    return useMemo(
        () => bindingsHydrated && detailsHydrated && endpointHydrated,
        [bindingsHydrated, detailsHydrated, endpointHydrated]
    );
}

export default useEntityWorkflowHydrated;
