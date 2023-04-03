import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import {
    useEndpointConfigStore_endpointConfigErrors,
    useEndpointConfigStore_endpointCustomErrors,
    useEndpointConfigStore_endpointSchema,
} from 'stores/EndpointConfig/hooks';

function EndpointConfigErrors() {
    const endpointCustomErrors = useEndpointConfigStore_endpointCustomErrors();
    const endpointErrors = useEndpointConfigStore_endpointConfigErrors();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    console.log('endpoint config error', {
        endpointErrors,
        endpointSchema,
        endpointCustomErrors,
    });

    return (
        <SectionError
            errors={endpointCustomErrors.concat(endpointErrors)}
            config={endpointSchema}
            configEmptyMessage="workflows.error.endpointConfig.empty"
            title="entityCreate.endpointConfig.endpointConfigHaveErrors"
        />
    );
}

export default EndpointConfigErrors;
