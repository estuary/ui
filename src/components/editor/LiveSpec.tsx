import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { LiveSpecEditorStoreNames, UseZustandStore } from 'context/Zustand';

interface Props {
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
}

function LiveSpecEditor({ liveSpecEditorStoreName, useZustandStore }: Props) {
    return (
        <EditorWithFileSelector
            editorStoreName={liveSpecEditorStoreName}
            useZustandStore={useZustandStore}
            disabled={true}
        />
    );
}

export default LiveSpecEditor;
