import type { EndpointConfigProps } from 'src/components/shared/Entity/EndpointConfig/types';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import EndpointConfigHeader from 'src/components/shared/Entity/EndpointConfig/Header';
import SectionContent from 'src/components/shared/Entity/EndpointConfig/SectionContent';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_errorsExist } from 'src/stores/EndpointConfig/hooks';

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
