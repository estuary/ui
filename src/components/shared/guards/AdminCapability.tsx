import type { InputBaseComponentProps } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'src/context/EntityContext';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';

function AdminCapabilityGuard({ children }: InputBaseComponentProps) {
    const intl = useIntl();

    const entityType = useEntityTypeTranslatedForWorkflows();

    const objectRoles = useEntitiesStore_capabilities_adminable(true);

    if (objectRoles.length === 0) {
        return (
            <AlertBox
                severity="error"
                short
                title={intl.formatMessage({
                    id: 'workflows.guards.admin.title',
                })}
            >
                {intl.formatMessage(
                    { id: 'workflows.guards.admin.message' },
                    {
                        entityType,
                    }
                )}
            </AlertBox>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AdminCapabilityGuard;
