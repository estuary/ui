import { Box, Fade, Stack, SxProps, Theme, Toolbar } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import LinearProgressTimed from 'components/progress/LinearProgressTimed';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import EntitySaveButton from './Actions/SaveButton';
import EntityTestButton from './Actions/TestButton';
import EntityViewDetails from './Actions/ViewDetails';
import HeaderLogs from './HeaderLogs';
import { EntityToolbarProps } from './types';

export const buttonSx: SxProps<Theme> = { ml: 1 };

function EntityToolbar({
    GenerateButton,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    primaryButtonProps,
    secondaryButtonProps,
    hideLogs,
    waitTimes,
}: EntityToolbarProps) {
    const generateWaitTime = waitTimes?.generate;

    // Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const discovering = !draftId && formStatus === FormStatus.GENERATING;
    const saved = formStatus === FormStatus.SAVED;
    const locked = formStatus === FormStatus.LOCKED;

    const PrimaryButton = PrimaryButtonComponent ?? EntitySaveButton;
    const SecondaryButton = SecondaryButtonComponent ?? EntityTestButton;

    return (
        <Stack spacing={2} sx={{ mb: 1 }}>
            <Toolbar disableGutters>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        'ml': 'auto',
                        '& > button': {
                            // TODO (theme) make this use truncateTextSx
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        },
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

            <Box
                sx={{
                    height: 2,
                }}
            >
                <Fade
                    in={Boolean(formActive && !saved && !locked)}
                    mountOnEnter
                    unmountOnExit
                >
                    <Box>
                        <LinearProgressTimed
                            wait={discovering ? generateWaitTime : undefined}
                        />
                    </Box>
                </Fade>
            </Box>

            {!hideLogs ? <HeaderLogs /> : null}
        </Stack>
    );
}

export default EntityToolbar;
