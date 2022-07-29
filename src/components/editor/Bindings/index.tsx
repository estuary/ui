import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { FormStateStoreNames, ResourceConfigStoreNames } from 'context/Zustand';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
}

function BindingsMultiEditor({
    resourceConfigStoreName,
    formStateStoreName,
}: Props) {
    return (
        <>
            <CollectionSelector
                resourceConfigStoreName={resourceConfigStoreName}
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
                        formStateStoreName={formStateStoreName}
                    />
                }
            />
        </>
    );
}

export default BindingsMultiEditor;
