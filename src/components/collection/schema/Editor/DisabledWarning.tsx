import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { useSchemaEvolution_autoDiscover } from 'src/stores/SchemaEvolution/hooks';

function DisabledWarning() {
    const intl = useIntl();

    const entityType = useEntityType();

    const autoDiscover = useSchemaEvolution_autoDiscover();

    if (!autoDiscover || entityType !== 'capture') {
        return null;
    }

    return (
        <AlertBox
            sx={{ maxWidth: 'fit-content' }}
            short
            severity="warning"
            title={intl.formatMessage({
                id: 'schemaEditor.editing.disabled.title',
            })}
        >
            {intl.formatMessage({
                id: 'schemaEditor.editing.disabled.message',
            })}
        </AlertBox>
    );
}

export default DisabledWarning;
