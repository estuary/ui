import {
    Stack,
    TableCell,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { tableBorderSx } from 'context/Theme';
import { ShardDetailStoreNames } from 'context/Zustand';

interface Props {
    name: string;
    showEntityStatus: boolean;
    shardDetailStoreName?: ShardDetailStoreNames;
}

function EntityName({ name, showEntityStatus, shardDetailStoreName }: Props) {
    const theme = useTheme();
    const belowLg = useMediaQuery(theme.breakpoints.down('lg'));

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
                {showEntityStatus && shardDetailStoreName ? (
                    <EntityStatus
                        name={name}
                        shardDetailStoreName={shardDetailStoreName}
                    />
                ) : null}

                <Typography
                    sx={
                        belowLg
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
