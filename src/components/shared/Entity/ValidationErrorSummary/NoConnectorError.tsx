import KeyValueList from 'src/components/shared/KeyValueList';

function NoConnectorError() {
    const filteredErrorsList: any[] = [
        {
            title: 'To start the creation process you must select a Connector. You can change this later.',
        },
    ];

    return (
        <KeyValueList
            data={filteredErrorsList}
            sectionTitle="Please select a Connector to begin"
        />
    );
}

export default NoConnectorError;
