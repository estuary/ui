import SectionError from 'src/components/shared/Entity/ValidationErrorSummary/SectionError';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_customErrors,
    useEndpointConfigStore_endpointConfigErrors,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import { useSecretsStore_serverUpdateRequired } from 'src/stores/Secrets/hooks';
import { hasLength } from 'src/utils/misc-utils';

function EndpointConfigErrors() {
    const isEdit = useEntityWorkflow_Editing();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const secretsServerUpdateRequired = useSecretsStore_serverUpdateRequired();

    const endpointCustomErrors = useEndpointConfigStore_customErrors();
    const endpointErrors = useEndpointConfigStore_endpointConfigErrors();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    // When editing we only care about errors if there is a server update needed
    // otherwise we can ignore. This is needed because Endpoing Config can
    // contains SOPS encrypted values that during edit are "blank" and throw
    // validation errors. This is especially true for OAuth connectors.
    //
    // `secretsServerUpdateRequired` is safe here because secrets only set that
    // flag for tasks without sops values, so it can't show false sops errors
    // when using secrets.
    if (isEdit && !serverUpdateRequired && !secretsServerUpdateRequired) {
        return null;
    } else {
        const errors = hasLength(endpointCustomErrors)
            ? endpointCustomErrors
            : endpointErrors;
        return (
            <SectionError
                errors={errors}
                config={endpointSchema}
                configEmptyMessage="workflows.error.endpointConfig.empty"
                title="entityCreate.endpointConfig.endpointConfigHaveErrors"
            />
        );
    }
}

export default EndpointConfigErrors;
