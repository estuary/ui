import { Terminal } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import DiscoveredSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/DiscoveredSchema';
import ExistingSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/ExistingSchema';
import EditCommandsWrapper from 'components/editor/Bindings/SchemaEdit/Commands/Wrapper';
import { useBindingsEditorStore_collectionData } from 'components/editor/Bindings/Store/hooks';
import ButtonWithPopper from 'components/shared/ButtonWithPopper';

function SchemaEditButton() {
    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();

    return collectionData ? (
        <ButtonWithPopper
            messageId="workflows.collectionSelector.cta.schemaEdit"
            popper={
                <EditCommandsWrapper>
                    {collectionData.belongsToDraft ? (
                        <DiscoveredSchemaCommands />
                    ) : (
                        <ExistingSchemaCommands />
                    )}
                </EditCommandsWrapper>
            }
            startIcon={<Terminal />}
        />
    ) : (
        <Skeleton variant="rectangular" width={75} />
    );
}

export default SchemaEditButton;
