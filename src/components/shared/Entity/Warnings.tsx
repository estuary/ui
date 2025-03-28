import { useMemo } from 'react';

import { Collapse } from '@mui/material';

import { FormattedMessage } from 'react-intl';

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
            <AlertBox
                short
                severity="warning"
                title={<FormattedMessage id="workflows.entityWarnings.title" />}
            >
                <FormattedMessage id="workflows.entityWarnings.message" />
            </AlertBox>
        </Collapse>
    );
}

export default EntityWarnings;
