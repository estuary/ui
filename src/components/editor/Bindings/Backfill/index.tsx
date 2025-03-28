import type { BackfillProps } from 'src/components/editor/Bindings/Backfill/types';

import { FormattedMessage } from 'react-intl';

import BackfillButton from 'src/components/editor/Bindings/Backfill/BackfillButton';
import SectionWrapper from 'src/components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';

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
