import {
    Dialog,
    DialogContent,
    DialogTitle,
    MenuItem,
    Popover,
    Typography,
} from '@mui/material';

import { Check } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import PrefixSelector from 'src/components/inputs/PrefixedName/PrefixSelector';
import {
    sideNavMenuAnchorOrigin,
    sideNavMenuTransformOrigin,
} from 'src/components/menus/shared';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useEntitiesStore_tenantsWithAdmin } from 'src/stores/Entities/hooks';
import { useTenantStore } from 'src/stores/Tenant';

interface OrgMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export const OrgMenu = ({ anchorEl, onClose }: OrgMenuProps) => {
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

    // Support users get the searchable dialog (every prefix); everyone else
    // gets the popover list anchored to the trigger.
    if (hasSupportAccess) {
        return (
            <Dialog
                open={Boolean(anchorEl)}
                onClose={onClose}
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
                            onClose();
                        }}
                        options={tenantNames}
                        value={selectedTenant}
                        variantString="outlined"
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
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
                            onClose();
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
    );
};
