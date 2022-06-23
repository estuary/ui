import EditorFileSelector from 'components/editor/FileSelector';
import ListAndDetails from 'components/editor/ListAndDetails';
import MonacoEditor, {
    Props as MonacoEditorProps,
} from 'components/editor/MonacoEditor';

export interface Props extends MonacoEditorProps {
    height?: number;
}

function EditorWithFileSelector(props: Props) {
    const { editorStoreName, useZustandStore } = props;

    return (
        <ListAndDetails
            list={
                <EditorFileSelector
                    editorStoreName={editorStoreName}
                    useZustandStore={useZustandStore}
                />
            }
            details={
                <MonacoEditor
                    {...props}
                    editorStoreName={editorStoreName}
                    useZustandStore={useZustandStore}
                />
            }
        />
    );
}

export default EditorWithFileSelector;
