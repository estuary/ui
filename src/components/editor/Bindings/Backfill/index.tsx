import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { FormattedMessage } from 'react-intl';
import BackfillButton from './BackfillButton';
import SectionWrapper from './SectionWrapper';
import { BackfillProps } from './types';

export default function Backfill({
    bindingIndex,
    collectionEnabled,
}: BackfillProps) {
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const showBackfillButton = isEdit && bindingIndex > -1 && collectionEnabled;

    return showBackfillButton || entityType === 'materialization' ? (
        <SectionWrapper>
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
        </SectionWrapper>
    ) : null;
}
