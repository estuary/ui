import BackfillButton from 'components/editor/Bindings/Backfill/BackfillButton';
import SectionWrapper from 'components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useIntl } from 'react-intl';

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
