import { Collapse } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_bindingErrorsExist } from 'stores/Binding/hooks';
import AlertBox from '../AlertBox';

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
