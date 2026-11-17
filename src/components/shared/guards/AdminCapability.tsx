import type { InputBaseComponentProps } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'src/context/EntityContext';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';

function AdminCapabilityGuard({ children }: InputBaseComponentProps) {
    const entityType = useEntityTypeTranslatedForWorkflows();

    const objectRoles = useEntitiesStore_capabilities_adminable(true);

    if (objectRoles.length === 0) {
        return (
            <AlertBox
                severity="error"
                short
                title="Missing required Access Grants or Storage Mapping"
            >
                {`You must have the admin capability to at least one prefix with a storage mapping to create a ${entityType}. Please contact an administrator to request access.`}
            </AlertBox>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AdminCapabilityGuard;
