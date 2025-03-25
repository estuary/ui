import { Box, TableCell, Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import ButtonWithPopper from 'components/shared/buttons/ButtonWithPopper';
import { linkButtonSx } from 'context/Theme';
import ControllerAlert from './ControllerAlert';
import type { ControllerErrorsProps } from './types';

export default function ControllerErrors({
    errors,
    popperPlacement,
}: ControllerErrorsProps) {
    if (errors.length === 0) {
        return (
            <TableCell>
                <Box
                    style={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        height: 24,
                        justifyContent: 'center',
                        padding: '0px 8px',
                        width: 64,
                    }}
                >
                    <Typography>{0}</Typography>
                </Box>
            </TableCell>
        );
    }

    return (
        <TableCell>
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
                    <AlertBox
                        severity="error"
                        short
                        sx={{
                            'mb': 1,
                            'width': 600,
                            '& .MuiAlert-message': {
                                width: '100%',
                            },
                        }}
                    >
                        {errors.map((error, index) => (
                            <ControllerAlert
                                key={`controller-error-alert-${index}`}
                                error={error}
                                hideBorder={errors.length - 1 === index}
                                mountClosed={errors.length > 1}
                            />
                        ))}
                    </AlertBox>
                }
                popperProps={{ placement: popperPlacement }}
            >
                {errors.length}
            </ButtonWithPopper>
        </TableCell>
    );
}
