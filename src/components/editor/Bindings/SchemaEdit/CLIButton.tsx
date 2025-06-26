import { Skeleton } from '@mui/material';

import { useIntl } from 'react-intl';

import DiscoveredSchemaCommands from 'src/components/editor/Bindings/SchemaEdit/Commands/DiscoveredSchema';
import ExistingSchemaCommands from 'src/components/editor/Bindings/SchemaEdit/Commands/ExistingSchema';
import EditCommandsWrapper from 'src/components/editor/Bindings/SchemaEdit/Commands/Wrapper';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_editModeEnabled,
} from 'src/components/editor/Bindings/Store/hooks';
import ButtonWithPopper from 'src/components/shared/buttons/ButtonWithPopper';
import useDisableSchemaEditing from 'src/hooks/useDisableSchemaEditing';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function SchemaEditCLIButton() {
    const intl = useIntl();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const editModeEnabled = useBindingsEditorStore_editModeEnabled();

    const disableSchemaEditing = useDisableSchemaEditing();

    // Form State
    const isActive = useFormStateStore_isActive();

    if (!editModeEnabled) return null;

    return collectionData ? (
        <ButtonWithPopper
            buttonProps={{
                disabled: isActive || disableSchemaEditing,
                variant: 'text',
            }}
            popper={
                <EditCommandsWrapper>
                    {collectionData.belongsToDraft ? (
                        <DiscoveredSchemaCommands />
                    ) : (
                        <ExistingSchemaCommands />
                    )}
                </EditCommandsWrapper>
            }
        >
            {intl.formatMessage({
                id: 'workflows.collectionSelector.cta.schemaEdit',
            })}
        </ButtonWithPopper>
    ) : (
        <Skeleton variant="rectangular" width={75} />
    );
}

export default SchemaEditCLIButton;
