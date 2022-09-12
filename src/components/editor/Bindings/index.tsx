import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { ResourceConfigStoreNames } from 'context/Zustand';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function BindingsMultiEditor({
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    return (
        <>
            <CollectionSelector readOnly={readOnly} />

            <ListAndDetails
                list={<BindingSelector />}
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
