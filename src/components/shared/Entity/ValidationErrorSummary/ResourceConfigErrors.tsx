import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
}

function ResourceConfigErrors({ resourceConfigStoreName }: Props) {
    const collections = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(resourceConfigStoreName, (state) => state.collections);

    const filteredResourceConfigErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    return (
        <SectionError
            errors={filteredResourceConfigErrors}
            errorMessage="entityCreate.endpointConfig.resourceConfigInvalid"
            config={collections}
            configEmptyMessage="entityCreate.endpointConfig.collectionsMissing"
            title="entityCreate.endpointConfig.resourceConfigHaveErrors"
        />
    );
}

export default ResourceConfigErrors;
