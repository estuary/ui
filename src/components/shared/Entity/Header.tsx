import { Box, Fade, Stack, SxProps, Theme, Toolbar } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import LinearProgressTimed from 'components/progress/LinearProgressTimed';
import { ReactNode } from 'react';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    GenerateButton: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    waitTimes?: {
        generate?: number;
    };
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

function EntityToolbar({
    GenerateButton,
    TestButton,
    SaveButton,
    waitTimes,
}: Props) {
    const generateWaitTime = waitTimes?.generate;

    // Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const discovering = !draftId && formStatus === FormStatus.GENERATING;

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
                        <>
                            {TestButton}

                            {SaveButton}
                        </>
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
                <Fade in={formActive} mountOnEnter unmountOnExit>
                    <Box>
                        <LinearProgressTimed
                            wait={discovering ? generateWaitTime : undefined}
                        />
                    </Box>
                </Fade>
            </Box>
        </Stack>
    );
}

export default EntityToolbar;
