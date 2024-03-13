import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_collections,
    useBinding_fullSourceErrorsExist,
    useBinding_resourceConfigErrors,
} from 'stores/Binding/hooks';
import { hasLength } from 'utils/misc-utils';

function ResourceConfigErrors() {
    const intl = useIntl();

    const collections = useBinding_collections();
    const filteredResourceConfigErrors = useBinding_resourceConfigErrors();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

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
            config={collections}
            configEmptyMessage="entityCreate.endpointConfig.collectionsMissing"
            title="entityCreate.endpointConfig.resourceConfigHaveErrors"
        />
    );
}

export default ResourceConfigErrors;
