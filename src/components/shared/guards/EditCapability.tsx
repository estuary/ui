import AlertBox from 'src/components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'src/context/EntityContext';
import useCanEditEntity from 'src/hooks/useCanEditEntity';
import { useIntl } from 'react-intl';
import { BaseComponentProps } from 'src/types';

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
