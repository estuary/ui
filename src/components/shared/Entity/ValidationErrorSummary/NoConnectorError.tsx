import { useIntl } from 'react-intl';

import KeyValueList from 'components/shared/KeyValueList';

function NoConnectorError() {
    const intl = useIntl();

    const filteredErrorsList: any[] = [
        {
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.noConnectorSelected',
            }),
        },
    ];

    return (
        <KeyValueList
            data={filteredErrorsList}
            sectionTitle={intl.formatMessage({
                id: 'entityCreate.endpointConfig.noConnectorSelectedTitle',
            })}
        />
    );
}

export default NoConnectorError;
