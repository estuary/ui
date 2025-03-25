import type { BackfillProps } from './types';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { FormattedMessage } from 'react-intl';
import BackfillButton from './BackfillButton';
import SectionWrapper from './SectionWrapper';

export default function Backfill({
    bindingIndex,
    collection,
    collectionEnabled,
}: BackfillProps) {
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const showBackfillButton = isEdit && bindingIndex > -1 && collectionEnabled;

    return showBackfillButton ? (
        <SectionWrapper
            alertMessageId="workflows.error.oldBoundCollection.backfill"
            collection={collection}
        >
            <BackfillButton
                bindingIndex={bindingIndex}
                description={
                    <FormattedMessage
                        id={`workflows.collectionSelector.manualBackfill.message.${entityType}`}
                    />
                }
            />
        </SectionWrapper>
    ) : null;
}
