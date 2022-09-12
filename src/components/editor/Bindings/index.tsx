import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';

interface Props {
    readOnly?: boolean;
}

function BindingsMultiEditor({ readOnly = false }: Props) {
    return (
        <>
            <CollectionSelector readOnly={readOnly} />

            <ListAndDetails
                list={<BindingSelector />}
                details={<BindingsEditor readOnly={readOnly} />}
            />
        </>
    );
}

export default BindingsMultiEditor;
