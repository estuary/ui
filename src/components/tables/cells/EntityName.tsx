import {
    Link,
    Stack,
    TableCell,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import EntityStatus from 'components/tables/cells/EntityStatus';
import { useIntl } from 'react-intl';
import { NavLink, useLocation } from 'react-router-dom';

interface Props {
    name: string;
    showEntityStatus: boolean;
    detailsLink: string;
}

function EntityName({ name, detailsLink, showEntityStatus }: Props) {
    const intl = useIntl();
    const location = useLocation();

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

                <Tooltip
                    title={intl.formatMessage({
                        id: 'entityTable.detailsLink',
                    })}
                >
                    <Link
                        component={NavLink}
                        to={detailsLink}
                        state={{ backButtonUrl: location }}
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
                </Tooltip>
            </Stack>
        </TableCell>
    );
}

export default EntityName;
