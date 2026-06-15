import { useState } from 'react';

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
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';

interface OrgMenuProps {
    // Whether the side nav is expanded; controls the trigger label visibility.
    open: boolean;
}

export const OrgMenu = ({ open }: OrgMenuProps) => {
    const intl = useIntl();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const setSelectedTenant = useTenantStore(
        (state) => state.setSelectedTenant
    );
    // Same tenant list the old TenantSelector showed everyone (incl. estuary_support).
    const tenantNames = useEntitiesStore_tenantsWithAdmin();
    const hasSupportAccess = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

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
                        options={tenantNames}
                        value={selectedTenant}
                        variantString="outlined"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
