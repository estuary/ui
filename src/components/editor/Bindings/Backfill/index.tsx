import type { BackfillProps } from 'src/components/editor/Bindings/Backfill/types';

import BackfillButton from 'src/components/editor/Bindings/Backfill/BackfillButton';
import BackfillDescription from 'src/components/editor/Bindings/Backfill/BackfillDescription';
import SectionWrapper from 'src/components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';

export default function Backfill({
    bindingIndex,
    collection,
    collectionEnabled,
}: BackfillProps) {
    const isEdit = useEntityWorkflow_Editing();

    const showBackfillButton = isEdit && bindingIndex > -1 && collectionEnabled;

    return showBackfillButton ? (
        <SectionWrapper
            alertMessageId="workflows.error.oldBoundCollection.backfill"
            collection={collection}
        >
            <BackfillButton
                bindingIndex={bindingIndex}
                description={<BackfillDescription />}
            />
        </SectionWrapper>
    ) : null;
}
