import { Link, Stack, TableCell, useMediaQuery, useTheme } from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { NavLink } from 'react-router-dom';

interface Props {
    name: string;
    showEntityStatus: boolean;
    detailsLink: string;
}

function EntityName({ name, detailsLink, showEntityStatus }: Props) {
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
                {showEntityStatus ? <EntityStatus name={name} /> : null}

                <Link
                    component={NavLink}
                    to={detailsLink}
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
                </Link>
            </Stack>
        </TableCell>
    );
}

export default EntityName;
