import type { EndpointConfigProps } from 'src/components/shared/Entity/EndpointConfig/types';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import EndpointConfigHeader from 'src/components/shared/Entity/EndpointConfig/Header';
import SectionContent from 'src/components/shared/Entity/EndpointConfig/SectionContent';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import HydrationError from 'src/components/shared/HydrationError';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_hydrationErrorsExist,
    useEndpointConfigStore_errorsExist,
} from 'src/stores/EndpointConfig/hooks';

function EndpointConfig({
    hideBorder,
    hideWrapper,
    readOnly = false,
}: EndpointConfigProps) {
    const connectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Endpoint Config Store
    const hydrationErrorsExist = useEndpointConfig_hydrationErrorsExist();
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

    if (!connectorId) {
        return null;
    }

    if (hideWrapper) {
        return <SectionContent readOnly={readOnly} />;
    }

    return (
        <WrapperWithHeader
            mountClosed={editWorkflow}
            forceClose={forceClose}
            readOnly={readOnly}
            hideBorder={hideBorder}
            header={<EndpointConfigHeader />}
        >
            {hydrationErrorsExist ? <HydrationError /> : null}
            <SectionContent readOnly={readOnly} />
        </WrapperWithHeader>
    );
}

export default EndpointConfig;
