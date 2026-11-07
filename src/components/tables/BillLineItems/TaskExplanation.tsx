import { useRef } from 'react';

import { boxClasses, IconButton, Stack, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { usePopupState } from 'material-ui-popup-state/hooks';

import PopperWrapper from 'src/components/shared/PopperWrapper';

const POPPER_KEY = '';
function TaskExplanation() {
    const anchorElement = useRef(null);

    const state = usePopupState({
        variant: 'popper',
        popupId: POPPER_KEY,
        disableAutoFocus: true,
    });

    return (
        <>
            <IconButton
                ref={anchorElement}
                onFocus={state.open}
                onMouseOver={state.open}
                onBlur={state.close}
                onMouseOut={state.close}
            >
                <HelpCircle id={POPPER_KEY} style={{ fontSize: 11 }} />
            </IconButton>

            <PopperWrapper
                anchorEl={anchorElement.current}
                open={state.isOpen}
                setOpen={(previousValue) => {
                    state.setOpen(!previousValue);
                }}
                popperProps={{
                    placement: 'right',
                    sx: {
                        [`& .${boxClasses.root}`]: {
                            maxWidth: 375,
                        },
                    },
                }}
            >
                <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 500 }}>
                        Each active connector counts as a task
                    </Typography>
                    <Typography>
                        {
                            'A connector (AKA "task") is billed based on the pro-rated portion of a month during which it was enabled, as measured in "task-hours". Approximately 720 task-hours accrue for a connector that is running nonstop for an entire month.'
                        }
                    </Typography>
                </Stack>
            </PopperWrapper>
        </>
    );
}

export default TaskExplanation;
