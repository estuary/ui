import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import {
    useEndpointConfigStore_endpointConfigErrors,
    useEndpointConfigStore_endpointSchema,
} from 'stores/EndpointConfig';

function EndpointConfigErrors() {
    const endpointErrors = useEndpointConfigStore_endpointConfigErrors();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    return (
        <SectionError
            errors={endpointErrors}
            config={endpointSchema}
            configEmptyMessage="workflows.error.endpointConfig.empty"
            title="entityCreate.endpointConfig.endpointConfigHaveErrors"
        />
    );
}

export default EndpointConfigErrors;
