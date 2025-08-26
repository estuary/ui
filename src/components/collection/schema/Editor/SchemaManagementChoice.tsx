import { RadioGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';

// TODO (schema editing management) - https://github.com/estuary/ui/issues/1606
//  Used to control switching between infer and manual schema management
function SchemaManagementChoice() {
    const intl = useIntl();

    return (
        <RadioGroup
            // value={scope}
            onChange={(event) => console.log('event', event)}
            style={{ textWrap: 'wrap' }}
        >
            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'schemaManagement.options.manual.description',
                })}
                label={intl.formatMessage({
                    id: 'schemaManagement.options.manual.label',
                })}
                value="manual"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'schemaManagement.options.auto.description',
                })}
                label={intl.formatMessage({
                    id: 'schemaManagement.options.auto.label',
                })}
                value="auto"
            />
        </RadioGroup>
    );
}

export default SchemaManagementChoice;
