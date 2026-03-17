import { CreateMappingWizard } from 'src/components/admin/Settings/StorageMappings/Dialog/Create';
import { UpdateMappingWizard } from 'src/components/admin/Settings/StorageMappings/Dialog/Update';
import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import StorageMappingsTable from 'src/components/tables/StorageMappings';

const docsUrl = 'https://docs.estuary.dev/concepts/storage-mappings/';

export function StorageMappings() {
    return (
        <>
            <StandAloneTableTitle
                messageIntlKey="storageMappings.message"
                titleIntlKey="storageMappings.header"
                docsUrl={docsUrl}
            />
            <StorageMappingsTable />

            {/* These wizards live here for now, but we could move them higher up the tree 
            if we wanted to present them from other parts of the UI */}
            <CreateMappingWizard />
            <UpdateMappingWizard />
        </>
    );
}
