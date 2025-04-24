import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import StorageMappingsTable from 'src/components/tables/StorageMappings';

const docsUrl = 'https://docs.estuary.dev/concepts/storage-mappings/';

function StorageMappings() {
    return (
        <>
            <StandAloneTableTitle
                messageIntlKey="storageMappings.message"
                titleIntlKey="storageMappings.header"
                docsUrl={docsUrl}
            />
            <StorageMappingsTable />
        </>
    );
}

export default StorageMappings;
