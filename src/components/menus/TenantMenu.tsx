/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
    Box,
    Chip,
    Typography,
    SxProps,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { NavLink } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { authenticatedRoutes } from 'app/routes';
import { useState } from 'react';

const nonInteractiveMenuStyling: SxProps = {
    '&:hover': {
        cursor: 'revert',
    },
};

const TenantMenu = () => {
    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = Object.keys(adminCapabilities);

    const [selectedTenant, setSelectedTenant] = useState(objectRoles[0]);

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    useEffectOnce(() => {
        console.log('showNotification effect');
        showNotification({
            description: (
                <Box>
                    <Chip label={objectRoles[0]} /> is missing payment
                    information and has an unpaid invoice. This can lead to the
                    tenant being disabled if not corrected in a timely manner.
                    Please provide your payment details by{' '}
                    <NavLink to={authenticatedRoutes.admin.billing.fullPath}>
                        clicking here
                    </NavLink>
                    .
                </Box>
            ),
            severity: 'error',
            title: (
                <Typography sx={{ fontWeight: 'bold' }}>
                    Missing payment information
                </Typography>
            ),
            options: {
                autoHideDuration: null,
            },
        });
    });

    if (objectRoles.length > 0) {
        return (
            <Box sx={{ minWidth: 150, maxWidth: 150 }}>
                <FormControl fullWidth sx={{ m: 1 }} size="small">
                    <InputLabel id="tenantMenu-label">tenant</InputLabel>
                    <Select
                        label="tenant"
                        labelId="tenantMenu-label"
                        value={selectedTenant}
                        onChange={(event) => {
                            setSelectedTenant(event.target.value);
                        }}
                    >
                        {objectRoles.map((objectRole) => {
                            return (
                                <MenuItem
                                    value={objectRole}
                                    sx={nonInteractiveMenuStyling}
                                    key={`tenantMenu-objectRoleList-${objectRole}`}
                                >
                                    {objectRole}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </Box>
        );
    } else {
        return null;
    }
};

export default TenantMenu;
