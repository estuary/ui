import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    Popover,
    Typography,
} from '@mui/material';

import { Building, Check } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import PrefixSelector from 'src/components/inputs/PrefixedName/PrefixSelector';
import {
    sideNavMenuAnchorOrigin,
    sideNavMenuTransformOrigin,
} from 'src/components/menus/shared';
import NavTriggerButton from 'src/components/navigation/NavTriggerButton';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    useEntitiesStore_capabilities_adminable,
    useEntitiesStore_tenantsWithAdmin,
} from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { hasLength } from 'src/utils/misc-utils';

interface OrgMenuProps {
    // Whether the side nav is expanded; controls the trigger label visibility.
    open: boolean;
}

const OrgMenu = ({ open }: OrgMenuProps) => {
    const intl = useIntl();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    const tenantNames = useEntitiesStore_tenantsWithAdmin();
    const hasSupportAccess = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );
    const allPrefixes = useEntitiesStore_capabilities_adminable(false);

    // Support users pick from every admin prefix (a potentially huge list, hence
    // the autocomplete dialog); everyone else picks from their top-level orgs.
    const availableTenants = useMemo(
        () => (hasSupportAccess ? allPrefixes : tenantNames),
        [allPrefixes, hasSupportAccess, tenantNames]
    );

    const prefixParam = useGlobalSearchParams(GlobalSearchParams.PREFIX);
    const appliedPrefixParam = useRef<string | null>(null);

    // The org menu is always mounted, so it owns selecting a tenant. Once the
    // available list loads: honor a `?prefix=` deep link (e.g. the billing "add
    // payment method" CTA) the first time it appears, then keep a still-valid
    // selection, otherwise fall back to the first available tenant. Tracking the
    // applied param lets a manual switch stick instead of losing to a stale
    // param lingering in the URL.
    useEffect(() => {
        if (!hasLength(availableTenants)) {
            return;
        }

        if (
            hasLength(prefixParam) &&
            availableTenants.includes(prefixParam) &&
            prefixParam !== appliedPrefixParam.current
        ) {
            appliedPrefixParam.current = prefixParam;

            if (prefixParam !== selectedTenant) {
                setSelectedTenant(prefixParam);
            }

            return;
        }

        if (!(selectedTenant && availableTenants.includes(selectedTenant))) {
            setSelectedTenant(availableTenants[0]);
        }
    }, [availableTenants, prefixParam, selectedTenant, setSelectedTenant]);

    const [orgAnchor, setOrgAnchor] = useState<HTMLElement | null>(null);
    const [orgDialogOpen, setOrgDialogOpen] = useState(false);

    const tenantLabel = selectedTenant
        ? selectedTenant.replace(/\/$/, '')
        : null;

    return (
        <>
            <NavTriggerButton
                open={open}
                onClick={(e) =>
                    hasSupportAccess
                        ? setOrgDialogOpen(true)
                        : setOrgAnchor(e.currentTarget)
                }
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

            <Dialog
                open={orgDialogOpen}
                onClose={() => setOrgDialogOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    <FormattedMessage id="tenant.organization" />
                </DialogTitle>
                <DialogContent>
                    <PrefixSelector
                        disabled={false}
                        error={false}
                        label={intl.formatMessage({
                            id: 'common.tenant',
                        })}
                        labelId="org-switcher"
                        onChange={(newValue) => {
                            setSelectedTenant(newValue);
                            setOrgDialogOpen(false);
                        }}
                        options={allPrefixes}
                        value={selectedTenant}
                        variantString="outlined"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default OrgMenu;
