import { useEditorStore_id } from 'components/editor/Store/hooks';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useEntityWorkflow } from 'context/Workflow';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEndpointConfigStore_errorsExist } from 'stores/EndpointConfig/hooks';
import SectionContent from './SectionContent';
import { EndpointConfigProps } from './types';

function EndpointConfig({
    hideBorder,
    hideWrapper,
    readOnly = false,
}: EndpointConfigProps) {
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Endpoint Config Store
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    // Workflow related props
    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

    // Only force close if there are no errors so users can see fields with issues
    // Also, this helps a bit so when a user is creating a materialization and
    //  opens the collection editor this section will _probably_ not close
    const forceClose =
        !editWorkflow && draftId !== null && !endpointConfigErrorsExist;

    if (!imageTag.connectorId) {
        return null;
    }

    if (hideWrapper) {
        return (
            <SectionContent connectorImage={imageTag.id} readOnly={readOnly} />
        );
    }

    return (
        <WrapperWithHeader
            mountClosed={editWorkflow}
            forceClose={forceClose}
            readOnly={readOnly}
            hideBorder={hideBorder}
            header={<EndpointConfigHeader />}
        >
            <SectionContent connectorImage={imageTag.id} readOnly={readOnly} />
        </WrapperWithHeader>
    );
}

export default EndpointConfig;
