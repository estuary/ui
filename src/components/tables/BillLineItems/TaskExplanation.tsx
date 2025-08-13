import { useRef } from 'react';

import { IconButton, Stack, Typography } from '@mui/material';

import { HelpCircle } from 'iconoir-react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useIntl } from 'react-intl';

import PopperWrapper from 'src/components/shared/PopperWrapper';

const POPPER_KEY = '';
function TaskExplanation() {
    const intl = useIntl();

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
                        ['& .MuiBox-root']: {
                            maxWidth: 375,
                        },
                    },
                }}
            >
                <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 500 }}>
                        {intl.formatMessage({
                            id: 'admin.billing.label.lineItems.tooltip.title',
                        })}
                    </Typography>
                    <Typography>
                        {intl.formatMessage({
                            id: 'admin.billing.label.lineItems.tooltip',
                        })}
                    </Typography>
                </Stack>
            </PopperWrapper>
        </>
    );
}

export default TaskExplanation;
