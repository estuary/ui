import CollectionSelector from 'components/collection/Selector';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';

function BindingsMultiEditor() {
    return (
        <>
            <CollectionSelector />
            <ListAndDetails
                list={<BindingSelector />}
                details={<BindingsEditor />}
            />
        </>
    );
}

export default BindingsMultiEditor;
