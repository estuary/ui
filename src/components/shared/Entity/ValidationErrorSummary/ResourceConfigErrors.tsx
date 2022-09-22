import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import {
    useResourceConfig_collections,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

function ResourceConfigErrors() {
    const collections = useResourceConfig_collections();

    const filteredResourceConfigErrors =
        useResourceConfig_resourceConfigErrorsExist();

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
