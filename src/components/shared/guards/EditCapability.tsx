import type { BaseComponentProps } from 'src/types';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityTypeTranslatedForWorkflows } from 'src/context/EntityContext';
import useCanEditEntity from 'src/hooks/useCanEditEntity';

function EditCapabilityGuard({ children }: BaseComponentProps) {
    const entityType = useEntityTypeTranslatedForWorkflows();
    const canEditEntity = useCanEditEntity();

    if (canEditEntity === false) {
        return (
            <AlertBox
                short={false}
                severity="error"
                title="Missing edit Access Grants"
            >
                {`You do not have edit capabilities for this ${entityType}. Please contact an administrator to request access.`}
            </AlertBox>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default EditCapabilityGuard;
