import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { FormStateStoreNames, ResourceConfigStoreNames } from 'context/Zustand';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
    readOnly?: boolean;
}

function BindingsMultiEditor({
    resourceConfigStoreName,
    formStateStoreName,
    readOnly = false,
}: Props) {
    return (
        <>
            <CollectionSelector
                resourceConfigStoreName={resourceConfigStoreName}
                formStateStoreName={formStateStoreName}
                readOnly={readOnly}
            />

            <ListAndDetails
                list={
                    <BindingSelector
                        resourceConfigStoreName={resourceConfigStoreName}
                    />
                }
                details={
                    <BindingsEditor
                        resourceConfigStoreName={resourceConfigStoreName}
                        readOnly={readOnly}
                    />
                }
            />
        </>
    );
}

export default BindingsMultiEditor;
