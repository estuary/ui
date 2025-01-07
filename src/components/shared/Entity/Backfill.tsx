import BackfillButton from 'components/editor/Bindings/Backfill/BackfillButton';
import SectionWrapper from 'components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useIntl } from 'react-intl';
import OnIncompatibleSchemaChange from '../../materialization/OnIncompatibleSchemaChange';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

export default function Backfill() {
    const intl = useIntl();

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    return isEdit || entityType === 'materialization' ? (
        <SectionWrapper>
            {isEdit ? (
                <BackfillButton
                    description={intl.formatMessage({
                        id: `workflows.collectionSelector.manualBackfill.message.${entityType}.allBindings`,
                    })}
                />
            ) : null}

            {entityType === 'materialization' ? (
                <ErrorBoundryWrapper>
                    <OnIncompatibleSchemaChange />
                </ErrorBoundryWrapper>
            ) : null}
        </SectionWrapper>
    ) : null;
}
