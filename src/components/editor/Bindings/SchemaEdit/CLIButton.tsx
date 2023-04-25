import { Skeleton } from '@mui/material';
import DiscoveredSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/DiscoveredSchema';
import ExistingSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/ExistingSchema';
import EditCommandsWrapper from 'components/editor/Bindings/SchemaEdit/Commands/Wrapper';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_editModeEnabled,
} from 'components/editor/Bindings/Store/hooks';
import ButtonWithPopper from 'components/shared/ButtonWithPopper';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

function SchemaEditCLIButton() {
    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    // Form State
    const isActive = useFormStateStore_isActive();

    if (!editModeEnabled) return null;

    return collectionData ? (
        <ButtonWithPopper
            variant="text"
            disabled={isActive}
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
        />
    ) : (
        <Skeleton variant="rectangular" width={75} />
    );
}

export default SchemaEditCLIButton;
