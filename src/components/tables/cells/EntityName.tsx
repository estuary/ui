import {
    Stack,
    TableCell,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import EntityStatus from 'src/components/tables/cells/EntityStatus';
import { ShardEntityTypes } from 'src/stores/ShardDetail/types';

interface Props {
    name: string;
    showEntityStatus: boolean;
    entityStatusTypes: ShardEntityTypes[];
}

function EntityName({ name, showEntityStatus, entityStatusTypes }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TableCell
            sx={{
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
                {showEntityStatus ? (
                    <EntityStatus name={name} taskTypes={entityStatusTypes} />
                ) : null}

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
