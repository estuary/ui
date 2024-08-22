import KeyValueList from 'components/shared/KeyValueList';
import { useIntl } from 'react-intl';
import { useConnectorStore } from 'stores/Connector/Store';

function ConnectorDetailsMissing() {
    const intl = useIntl();

    const hydrationError = useConnectorStore((state) => state.hydrationError);

    return (
        <KeyValueList
            data={[
                {
                    title: hydrationError ?? '',
                },
            ]}
            sectionTitle={intl.formatMessage({
                id: 'entityCreate.endpointConfig.connectorDetailsMissingTitle',
            })}
        />
    );
}

export default ConnectorDetailsMissing;
