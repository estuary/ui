import { Collapse } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_collectionErrorsExist } from 'stores/ResourceConfig/hooks';
import AlertBox from '../AlertBox';

function EntityWarnings() {
    const entityType = useEntityType();

    const missingCollections = useResourceConfig_collectionErrorsExist();

    const warnEmptyBindings = useMemo(() => {
        return Boolean(entityType === 'materialization' && missingCollections);
    }, [entityType, missingCollections]);

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
