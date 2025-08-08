import type { EntityToolbarProgressProps } from 'src/components/shared/Entity/types';

import { Box, Fade } from '@mui/material';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import LinearProgressTimed from 'src/components/progress/LinearProgressTimed';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

function HeaderProgress({ waitTimes }: EntityToolbarProgressProps) {
    const generateWaitTime = waitTimes?.generate;

    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const discovering = !draftId && formStatus === FormStatus.GENERATING;

    return (
        <Box
            sx={{
                height: 2,
            }}
        >
            <Fade
                in={Boolean(
                    formActive &&
                        formStatus !== FormStatus.SAVED &&
                        formStatus !== FormStatus.LOCKED
                )}
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
