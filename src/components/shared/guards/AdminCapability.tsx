import { InputBaseComponentProps } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'src/context/EntityContext';
import { useEntitiesStore_atLeastOneAdminTenant } from 'src/stores/Entities/hooks';

function AdminCapabilityGuard({ children }: InputBaseComponentProps) {
    const intl = useIntl();

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    const entityType = useEntityTypeTranslatedForWorkflows();

    if (!atLeastOneAdminTenant) {
        return (
            <AlertBox
                short={false}
                severity="error"
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
