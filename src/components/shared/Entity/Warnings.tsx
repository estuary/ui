import { useMemo } from 'react';

import { Collapse } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { useBinding_bindingErrorsExist } from 'src/stores/Binding/hooks';

function EntityWarnings() {
    const entityType = useEntityType();

    const missingBindings = useBinding_bindingErrorsExist();

    const warnEmptyBindings = useMemo(() => {
        return Boolean(entityType === 'materialization' && missingBindings);
    }, [entityType, missingBindings]);

    return (
        <Collapse in={warnEmptyBindings} unmountOnExit>
            <AlertBox short severity="warning" title="No collections">
                You have not added any collections yet. This means there will be
                no data output from this materialization. To add collections,
                use the Source Collections section.
            </AlertBox>
        </Collapse>
    );
}

export default EntityWarnings;
