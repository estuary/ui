import { useEffect, useRef, useState } from 'react';

import { MenuItem, Popover, Typography } from '@mui/material';

import { Building, Check } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import {
    sideNavMenuAnchorOrigin,
    sideNavMenuTransformOrigin,
} from 'src/components/menus/shared';
import NavTriggerButton from 'src/components/navigation/NavTriggerButton';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

interface OrgMenuProps {
    // Whether the side nav is expanded; controls the trigger label visibility.
    open: boolean;
}

const OrgMenu = ({ open }: OrgMenuProps) => {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    const tenantNames = useEntitiesStore_tenantsWithAdmin();

    const prefixParam = useGlobalSearchParams(GlobalSearchParams.PREFIX);
    const appliedPrefixParam = useRef<string | null>(null);

    // The org menu is always mounted, so it owns selecting a tenant. Once the
    // tenant list loads: honor a `?prefix=` deep link (e.g. the billing "add
    // payment method" CTA) the first time it appears, then keep a still-valid
    // selection, otherwise fall back to the first available tenant. Tracking the
    // applied param lets a manual switch stick instead of losing to a stale
    // param lingering in the URL.
    useEffect(() => {
        if (!hasLength(tenantNames)) {
            return;
        }

        if (
            hasLength(prefixParam) &&
            tenantNames.includes(prefixParam) &&
            prefixParam !== appliedPrefixParam.current
        ) {
            appliedPrefixParam.current = prefixParam;

            if (prefixParam !== selectedTenant) {
                setSelectedTenant(prefixParam);
            }

            return;
        }

        if (!(selectedTenant && tenantNames.includes(selectedTenant))) {
            setSelectedTenant(tenantNames[0]);
        }
    }, [prefixParam, selectedTenant, setSelectedTenant, tenantNames]);

    const [orgAnchor, setOrgAnchor] = useState<HTMLElement | null>(null);

    const tenantLabel = selectedTenant
        ? selectedTenant.replace(/\/$/, '')
        : null;

    return (
        <>
            <NavTriggerButton
                open={open}
                onClick={(e) => setOrgAnchor(e.currentTarget)}
                icon={<Building />}
                label={tenantLabel}
            />

            <Popover
                open={Boolean(orgAnchor)}
                anchorEl={orgAnchor}
                onClose={() => setOrgAnchor(null)}
                anchorOrigin={sideNavMenuAnchorOrigin}
                transformOrigin={sideNavMenuTransformOrigin}
                slotProps={{
                    paper: {
                        sx: {
                            width: 240,
                            p: 1,
                            borderRadius: 2,
                        },
                    },
                }}
            >
                <Typography
                    sx={{
                        px: 1,
                        pt: 0.5,
                        pb: 1,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'text.secondary',
                    }}
                >
                    <FormattedMessage id="tenant.organization" />
                </Typography>

                {tenantNames.map((tenant) => {
                    const label = tenant.replace(/\/$/, '');
                    const isSelected = tenant === selectedTenant;

                    return (
                        <MenuItem
                            key={tenant}
                            selected={isSelected}
                            onClick={() => {
                                setSelectedTenant(tenant);
                                setOrgAnchor(null);
                            }}
                            sx={{
                                borderRadius: 1,
                                fontSize: 13,
                                py: 0.75,
                                justifyContent: 'space-between',
                            }}
                        >
                            {label}

                            {isSelected ? <Check /> : null}
                        </MenuItem>
                    );
                })}
            </Popover>
        </>
    );
};

export default OrgMenu;
