import type { SxProps, Theme } from '@mui/material';
import {
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { semiTransparentBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import type { TableColumns } from 'types';

interface Props {
    columns: TableColumns[];
}

function InformationTableHeader({ columns }: Props) {
    const theme = useTheme();
    const tableHeaderFooterSx: SxProps<Theme> = {
        bgcolor: semiTransparentBackground[theme.palette.mode],
    };

    return (
        <TableHead>
            <TableRow sx={{ ...tableHeaderFooterSx }}>
                {columns.map((column, index) => (
                    <TableCell key={`${column.field}-${index}`}>
                        <Typography>
                            {column.headerIntlKey ? (
                                <FormattedMessage id={column.headerIntlKey} />
                            ) : null}
                        </Typography>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export default InformationTableHeader;
