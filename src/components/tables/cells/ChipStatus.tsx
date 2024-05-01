import { AlertColor, Chip, TableCell, Theme } from '@mui/material';
import { outlinedColoredChipBackground } from 'context/Theme';
import { useIntl } from 'react-intl';

interface Props {
    messageId: string;
    color: AlertColor;
}

const getOutlineColor = (theme: Theme, color: AlertColor) =>
    theme.palette.mode === 'dark'
        ? theme.palette[color].main
        : theme.palette[color].dark;

function ChipStatus({ messageId, color }: Props) {
    const intl = useIntl();

    return (
        <TableCell>
            <Chip
                component="span"
                label={intl.formatMessage({ id: messageId })}
                size="small"
                variant="outlined"
                sx={{
                    borderColor: (theme) => getOutlineColor(theme, color),
                    backgroundColor: outlinedColoredChipBackground[color],
                }}
            />
        </TableCell>
    );
}

export default ChipStatus;
