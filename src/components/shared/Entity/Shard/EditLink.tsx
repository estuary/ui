import { Button } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { Entity } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

type AllowedPaths = keyof Pick<
    typeof authenticatedRoutes,
    'captures' | 'materializations'
>;

interface Props {
    liveSpecId: string;
    name: string;
    pathPrefix: Entity;
}

function EditLink({ liveSpecId, name, pathPrefix }: Props) {
    const intl = useIntl();
    const to = useMemo(() => {
        const path: AllowedPaths | null =
            pathPrefix === 'capture'
                ? 'captures'
                : pathPrefix === 'materialization'
                ? 'materializations'
                : null;

        if (path) {
            return getPathWithParams(authenticatedRoutes[path].edit.fullPath, {
                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
            });
        }

        return null;
    }, [liveSpecId, pathPrefix]);

    // We currently do not allow users to edit derivations so just return nothing
    if (!to) {
        return null;
    }

    return (
        <NavLink
            style={{ textDecoration: 'none' }}
            to={to}
            aria-label={intl.formatMessage(
                { id: 'entityTable.edit.aria' },
                { name }
            )}
        >
            <Button variant="text" size="small" disableElevation sx={{ mr: 1 }}>
                <FormattedMessage id="cta.edit" />
            </Button>
        </NavLink>
    );
}

export default EditLink;
