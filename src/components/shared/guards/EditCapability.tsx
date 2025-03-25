import type { BaseComponentProps } from 'types';
import AlertBox from 'components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'context/EntityContext';
import useCanEditEntity from 'hooks/useCanEditEntity';
import { useIntl } from 'react-intl';

function EditCapabilityGuard({ children }: BaseComponentProps) {
    const intl = useIntl();
    const entityType = useEntityTypeTranslatedForWorkflows();
    const canEditEntity = useCanEditEntity();

    if (canEditEntity === false) {
        return (
            <AlertBox
                short={false}
                severity="error"
                title={intl.formatMessage({
                    id: 'workflows.guards.edit.title',
                })}
            >
                {intl.formatMessage(
                    { id: 'workflows.guards.edit.message' },
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

export default EditCapabilityGuard;
