import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, TableCell } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    onClick?: any;
    disabled?: boolean;
    expanded?: boolean;
}

function DetailsAction({ onClick, disabled, expanded }: Props) {
    return (
        <TableCell>
            <Box
                sx={{
                    display: 'flex',
                }}
            >
                <Button
                    variant="contained"
                    size="small"
                    disableElevation
                    sx={{ mr: 1 }}
                    disabled={disabled}
                    onClick={onClick}
                    endIcon={
                        // TODO (duplication) this is copied a few times
                        <KeyboardArrowDownIcon
                            sx={{
                                marginRight: 0,
                                transform: `rotate(${
                                    expanded ? '180' : '0'
                                }deg)`,
                                transition: 'all 250ms ease-in-out',
                            }}
                        />
                    }
                >
                    <FormattedMessage id="cta.details" />
                </Button>
            </Box>
        </TableCell>
    );
}

export default DetailsAction;
