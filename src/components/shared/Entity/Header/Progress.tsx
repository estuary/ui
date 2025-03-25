import { Box, Fade } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import LinearProgressTimed from 'components/progress/LinearProgressTimed';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import type { EntityToolbarProgressProps } from '../types';

function HeaderProgress({ waitTimes }: EntityToolbarProgressProps) {
    const generateWaitTime = waitTimes?.generate;

    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const discovering = !draftId && formStatus === FormStatus.GENERATING;
    const saved = formStatus === FormStatus.SAVED;
    const locked = formStatus === FormStatus.LOCKED;

    return (
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
    );
}

export default HeaderProgress;
