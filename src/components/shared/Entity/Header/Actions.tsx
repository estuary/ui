import { Stack, Toolbar } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { truncateTextSx } from 'context/Theme';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import EntitySaveButton from '../Actions/SaveButton';
import EntityTestButton from '../Actions/TestButton';
import EntityViewDetails from '../Actions/ViewDetails';
import { EntityToolbarActionProps } from '../types';

function HeaderActions({
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

    return (
        <Toolbar disableGutters>
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    'ml': 'auto',
                    // TODO (typing) - should udpate the global typings
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
        </Toolbar>
    );
}

export default HeaderActions;
