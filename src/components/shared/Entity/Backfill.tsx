import { useIntl } from 'react-intl';

import BackfillButton from 'src/components/editor/Bindings/Backfill/BackfillButton';
import SectionWrapper from 'src/components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';

export default function Backfill() {
    const intl = useIntl();

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    if (!isEdit) {
        return null;
    }

    return (
        <SectionWrapper alertMessageId="workflows.error.oldBoundCollection.backfillAll">
            <BackfillButton
                description={intl.formatMessage({
                    id: `workflows.collectionSelector.manualBackfill.message.${entityType}.allBindings`,
                })}
            />
        </SectionWrapper>
    );
}
