import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { useRouteStore } from 'hooks/useRouteStore';
import { entityCreateStoreSelectors } from 'stores/Create';

function ResourceConfigErrors() {
    const useEntityCreateStore = useRouteStore();
    const collections = useEntityCreateStore(
        entityCreateStoreSelectors.collections.get
    );

    const filteredResourceConfigErrors = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.errors
    );

    console.log('resource config errors', {
        filteredResourceConfigErrors,
    });

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
