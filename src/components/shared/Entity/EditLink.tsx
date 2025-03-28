import { useMemo } from 'react';

import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { useEntityType } from 'src/context/EntityContext';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

type AllowedPaths = keyof Pick<
    typeof authenticatedRoutes,
    'captures' | 'materializations'
>;

interface Props {
    liveSpecId: string;
    name: string;
    variant?: ButtonProps['variant'];
}

function EditLink({ liveSpecId, name, variant }: Props) {
    const entityType = useEntityType();

    const intl = useIntl();
    const to = useMemo(() => {
        const path: AllowedPaths | null =
            entityType === 'capture'
                ? 'captures'
                : entityType === 'materialization'
                  ? 'materializations'
                  : null;

        if (path) {
            return getPathWithParams(authenticatedRoutes[path].edit.fullPath, {
                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpecId,
            });
        }

        return null;
    }, [liveSpecId, entityType]);

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
            <Button
                variant={variant ?? 'text'}
                size="small"
                disableElevation
                sx={{ mr: 1 }}
            >
                <FormattedMessage id="cta.edit" />
            </Button>
        </NavLink>
    );
}

export default EditLink;
