import { useBindingsEditorStore_fullSourceErrorsExist } from 'components/editor/Bindings/Store/hooks';
import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useResourceConfig_resourceConfigErrors } from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';

function ResourceConfigErrors() {
    const intl = useIntl();

    const filteredResourceConfigErrors =
        useResourceConfig_resourceConfigErrors();

    const fullSourceErrorsExist =
        useBindingsEditorStore_fullSourceErrorsExist();

    const errorMessages = useMemo(() => {
        const response = [];

        if (hasLength(filteredResourceConfigErrors)) {
            response.push({
                message: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.resourceConfigInvalid',
                }),
            });
        }

        if (fullSourceErrorsExist) {
            response.push({
                message: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.fullSourceInvalid',
                }),
            });
        }

        return response;
    }, [filteredResourceConfigErrors, fullSourceErrorsExist, intl]);

    return (
        <SectionError
            errors={errorMessages}
            configEmptyMessage="entityCreate.endpointConfig.collectionsMissing"
            title="entityCreate.endpointConfig.resourceConfigHaveErrors"
        />
    );
}

export default ResourceConfigErrors;
