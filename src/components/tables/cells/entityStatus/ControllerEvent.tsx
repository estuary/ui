import { Box, Typography } from '@mui/material';
import ButtonWithPopper from 'components/shared/buttons/ButtonWithPopper';
import { linkButtonSx } from 'context/Theme';
import { ControllerEventProps } from './types';

export default function ControllerEvent({
    detail,
    popperPlacement,
}: ControllerEventProps) {
    return (
        <ButtonWithPopper
            buttonProps={{
                variant: 'text',
                sx: {
                    ...linkButtonSx,
                    fontWeight: 400,
                    textAlign: 'left',
                    textTransform: 'unset',
                },
            }}
            popper={
                <Box style={{ width: 500 }}>
                    <Typography>Hello!</Typography>
                </Box>
            }
            popperProps={{ placement: popperPlacement }}
        >
            {detail}
        </ButtonWithPopper>
    );
}
