import {
    Stack,
    TableCell,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { tableBorderSx } from 'context/Theme';

interface Props {
    name: string;
    showEntityStatus: boolean;
}

function EntityName({ name, showEntityStatus }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 250,
                maxWidth: 'min-content',
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                }}
            >
                {showEntityStatus ? <EntityStatus name={name} /> : null}

                <Typography
                    sx={
                        belowMd
                            ? {
                                  overflowWrap: 'break-word',
                                  wordBreak: 'break-all',
                              }
                            : undefined
                    }
                >
                    {name}
                </Typography>
            </Stack>
        </TableCell>
    );
}

export default EntityName;
