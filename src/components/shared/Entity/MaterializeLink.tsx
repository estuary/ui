import { Button, ButtonProps } from '@mui/material';
import { authenticatedRoutes } from 'src/app/routes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props {
    liveSpecId: string;
    name: string;
    variant?: ButtonProps['variant'];
}

function MaterializeLink({ liveSpecId, name, variant }: Props) {
    const intl = useIntl();
    const to = useMemo(() => {
        return getPathWithParams(
            authenticatedRoutes.materializations.create.fullPath,
            {
                [GlobalSearchParams.PREFILL_LIVE_SPEC_ID]: liveSpecId,
            }
        );
    }, [liveSpecId]);

    return (
        <NavLink
            style={{ textDecoration: 'none' }}
            to={to}
            aria-label={intl.formatMessage(
                { id: 'entityTable.materialize.aria' },
                { name }
            )}
        >
            <Button
                variant={variant ?? 'text'}
                size="small"
                disableElevation
                sx={{ mr: 1 }}
            >
                <FormattedMessage id="cta.materialize" />
            </Button>
        </NavLink>
    );
}

export default MaterializeLink;
