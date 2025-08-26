import type { EntityToolbarActionProps } from 'src/components/shared/Entity/types';

import { Stack } from '@mui/material';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import EntitySaveButton from 'src/components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'src/components/shared/Entity/Actions/TestButton';
import EntityViewDetails from 'src/components/shared/Entity/Actions/ViewDetails';
import { truncateTextSx } from 'src/context/Theme';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

function HeaderActions({
    expressWorkflow,
    GenerateButton,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    primaryButtonProps,
    secondaryButtonProps,
}: EntityToolbarActionProps) {
    // Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formStatus = useFormStateStore_status();
    const saved = formStatus === FormStatus.SAVED;

    const PrimaryButton = PrimaryButtonComponent ?? EntitySaveButton;
    const SecondaryButton = SecondaryButtonComponent ?? EntityTestButton;

    if (expressWorkflow && saved) {
        return null;
    }

    return (
        <Stack
            direction="row"
            alignItems="center"
            sx={{
                'ml': 'auto',
                // TODO (typing) - should update the global typings
                //  to allow them to be nested in other `sx` props
                '& > button': truncateTextSx as any,
            }}
        >
            {draftId ? (
                saved ? (
                    <EntityViewDetails />
                ) : (
                    <>
                        <SecondaryButton {...secondaryButtonProps} />

                        <PrimaryButton {...primaryButtonProps} />
                    </>
                )
            ) : (
                GenerateButton
            )}
        </Stack>
    );
}

export default HeaderActions;
