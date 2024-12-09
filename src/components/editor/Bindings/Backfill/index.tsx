import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { FormattedMessage } from 'react-intl';
import OnIncompatibleSchemaChange from '../OnIncompatibleSchemaChange';
import BackfillButton from './BackfillButton';
import BackfillSection from './SectionWrapper';
import { BackfillProps } from './types';

export default function Backfill({
    bindingIndex,
    collectionEnabled,
}: BackfillProps) {
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const showBackfillButton = isEdit && bindingIndex > -1 && collectionEnabled;

    return showBackfillButton || entityType === 'materialization' ? (
        <BackfillSection>
            {showBackfillButton ? (
                <BackfillButton
                    bindingIndex={bindingIndex}
                    description={
                        <FormattedMessage
                            id={`workflows.collectionSelector.manualBackfill.message.${entityType}`}
                        />
                    }
                />
            ) : null}

            {entityType === 'materialization' ? (
                <ErrorBoundryWrapper>
                    <OnIncompatibleSchemaChange bindingIndex={bindingIndex} />
                </ErrorBoundryWrapper>
            ) : null}
        </BackfillSection>
    ) : null;
}
