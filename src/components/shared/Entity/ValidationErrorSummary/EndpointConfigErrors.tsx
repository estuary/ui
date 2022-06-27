import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { useRouteStore } from 'hooks/useRouteStore';
import { entityCreateStoreSelectors } from 'stores/Create';

function EndpointConfigErrors() {
    const useEntityCreateStore = useRouteStore();
    const endpointErrors = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.errors
    );
    const endpointSchema = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );

    console.log('endpoint config', endpointErrors);

    return (
        <SectionError
            errors={endpointErrors}
            config={endpointSchema}
            configEmptyMessage="entityCreate.endpointConfig.endpointConfigMissing"
        />
    );
}

export default EndpointConfigErrors;
