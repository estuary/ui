import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { LiveSpecEditorStoreNames } from 'context/Zustand';

interface Props {
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
}

function LiveSpecEditor({ liveSpecEditorStoreName }: Props) {
    return (
        <EditorWithFileSelector
            editorStoreName={liveSpecEditorStoreName}
            disabled={true}
        />
    );
}

export default LiveSpecEditor;
