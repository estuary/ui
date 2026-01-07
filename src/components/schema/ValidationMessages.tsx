import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_collectionInitializationAlert,
    useBindingsEditorStore_schemaUpdateErrored,
} from 'src/components/editor/Bindings/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'src/stores/Binding/hooks';

function ValidationMessages() {
    const intl = useIntl();

    // Binding Store
    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();
    const collectionInitializationAlert =
        useBindingsEditorStore_collectionInitializationAlert();

    const schemaUpdateErrored = useBindingsEditorStore_schemaUpdateErrored();

    if (
        !currentCollection ||
        !currentBindingUUID ||
        collectionData === undefined
    ) {
        return null;
    }

    return (
        <>
            {schemaUpdateErrored ? (
                <AlertBox severity="warning" short>
                    {intl.formatMessage({
                        id: 'workflows.collectionSelector.schemaEdit.alert.message.schemaUpdateError',
                    })}
                </AlertBox>
            ) : null}

            {collectionInitializationAlert ? (
                <AlertBox
                    short
                    severity={collectionInitializationAlert.severity}
                    title={intl.formatMessage({
                        id: 'workflows.collectionSelector.error.title.editorInitialization',
                    })}
                >
                    {intl.formatMessage({
                        id: collectionInitializationAlert.messageId,
                    })}
                </AlertBox>
            ) : null}
        </>
    );
}

export default ValidationMessages;
