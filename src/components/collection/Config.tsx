import type { CollectionConfigProps } from 'src/components/collection/types';

import SectionAlertIndicator from 'src/components/collection/SectionAlertIndicator';
import BindingsMultiEditor from 'src/components/editor/Bindings';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import HydrationError from 'src/components/shared/HydrationError';
import { useBinding_hydrationErrorsExist } from 'src/stores/Binding/hooks';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

function CollectionConfig({
    draftSpecs,
    readOnly = false,
    hideBorder,
    RediscoverButton,
}: CollectionConfigProps) {
    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();
    const collectionsError = useWorkflowStore(
        (state) => state.collectionsError
    );

    return (
        <WrapperWithHeader
            hideBorder={hideBorder}
            header={<SectionAlertIndicator />}
        >
            <ErrorBoundryWrapper>
                {bindingHydrationErrorsExist || collectionsError ? (
                    <HydrationError>
                        {collectionsError
                            ? 'There was an issue fetching data related to your collections. Please try again.'
                            : 'There was an issue fetching data related to your bindings. Please try again.'}
                    </HydrationError>
                ) : (
                    <BindingsMultiEditor
                        draftSpecs={draftSpecs}
                        readOnly={readOnly}
                        RediscoverButton={RediscoverButton}
                    />
                )}
            </ErrorBoundryWrapper>
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
