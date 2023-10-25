import { Button, TableCell } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    liveSpecId: string;
    name: string;
}

function EditTask({ liveSpecId, name }: Props) {
    const intl = useIntl();

    const to = useMemo(
        () =>
            getPathWithParams(authenticatedRoutes.captures.edit.fullPath, {
                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
            }),
        [liveSpecId]
    );

    return (
        <TableCell>
            <NavLink
                style={{ textDecoration: 'none' }}
                to={to}
                aria-label={intl.formatMessage(
                    { id: 'entityTable.edit.aria' },
                    { name }
                )}
            >
                <Button
                    variant="text"
                    size="small"
                    disableElevation
                    sx={{ mr: 1 }}
                >
                    <FormattedMessage id="cta.edit" />
                </Button>
            </NavLink>
        </TableCell>
    );
}

export default EditTask;
