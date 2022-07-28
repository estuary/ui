import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import {
    DetailsFormStoreNames,
    ResourceConfigStoreNames,
} from 'context/Zustand';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function BindingsMultiEditor({
    resourceConfigStoreName,
    detailsFormStoreName,
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
                        detailsFormStoreName={detailsFormStoreName}
                    />
                }
            />
        </>
    );
}

export default BindingsMultiEditor;
