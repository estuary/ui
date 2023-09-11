import { InputBaseComponentProps } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEntitiesStore_capabilities_adminable } from 'stores/Entities/hooks';
import { hasLength } from 'utils/misc-utils';

function AdminCapabilityGuard({ children }: InputBaseComponentProps) {
    const intl = useIntl();

    const entityTypeValue = useEntityType();

    const adminCapabilities = useEntitiesStore_capabilities_adminable();
    const objectRoles = useMemo(
        () => Object.keys(adminCapabilities),
        [adminCapabilities]
    );

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

    if (!hasLength(objectRoles)) {
        return (
            <AlertBox
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
