import { useMemo } from 'react';
import { useDetailsForm_hydrated } from 'stores/DetailsForm/hooks';
import { useEndpointConfig_hydrated } from 'stores/EndpointConfig/hooks';
import { useResourceConfig_hydrated } from 'stores/ResourceConfig/hooks';

// TODO (forms)
// Later on we might want to build this out in a way where forms can
//  basically "register" with the submit button and then inform it when
//  they are done loading, invalid, etc.

// This checks the main 3 forms that are always there. This does not cover
//  every use case so some things might slip through - but it is way better
//  than not checking any of this stuff.
function useEntityWorkflowHydrated() {
    const resourceConfigHydrated = useResourceConfig_hydrated();
    const detailsHydrated = useDetailsForm_hydrated();
    const endpointHydrated = useEndpointConfig_hydrated();

    return useMemo(
        () => resourceConfigHydrated && detailsHydrated && endpointHydrated,
        [detailsHydrated, endpointHydrated, resourceConfigHydrated]
    );
}

export default useEntityWorkflowHydrated;
