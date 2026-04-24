import BackfillButton from 'src/components/editor/Bindings/Backfill/BackfillButton';
import BackfillDescription from 'src/components/editor/Bindings/Backfill/BackfillDescription';
import SectionWrapper from 'src/components/editor/Bindings/Backfill/SectionWrapper';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';

export default function Backfill() {
    const isEdit = useEntityWorkflow_Editing();

    if (!isEdit) {
        return null;
    }

    return (
        <SectionWrapper alertMessageId="workflows.error.oldBoundCollection.backfillAll">
            <BackfillButton description={<BackfillDescription allBindings />} />
        </SectionWrapper>
    );
}
