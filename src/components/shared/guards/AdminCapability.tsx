import { InputBaseComponentProps } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEntitiesStore_atLeastOneAdminTenant } from 'stores/Entities/hooks';

function AdminCapabilityGuard({ children }: InputBaseComponentProps) {
    const intl = useIntl();

    const entityTypeValue = useEntityType();

    const atLeastOneAdminTenant = useEntitiesStore_atLeastOneAdminTenant();

    // TODO (maybe) Possibly we should just include this logic in the useEntityType hook?
    // Just to be safe translating the entity type from the hook. Probably was safe just passing
    //  it along but this allows for future internationalization support.
    const entityType = useMemo(() => {
        switch (entityTypeValue) {
            case 'capture':
                return intl.formatMessage({ id: 'terms.capture' });
                break;
            case 'materialization':
                return intl.formatMessage({ id: 'terms.materialization' });
                break;
            case 'collection':
                return intl.formatMessage({ id: 'terms.transformation' });
                break;
            default:
                return intl.formatMessage({ id: 'terms.entity' });
                break;
        }
    }, [entityTypeValue, intl]);

    if (!atLeastOneAdminTenant) {
        return (
            <AlertBox
                short={false}
                severity="error"
                title={<FormattedMessage id="workflows.guards.admin.title" />}
            >
                <FormattedMessage
                    id="workflows.guards.admin.message"
                    values={{
                        entityType,
                    }}
                />
            </AlertBox>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AdminCapabilityGuard;
