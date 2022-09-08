import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { LiveSpecEditorStoreNames, UseZustandStore } from 'context/Zustand';

interface Props {
    liveSpecEditorStoreName: LiveSpecEditorStoreNames;
    useZustandStore: UseZustandStore;
    localZustandScope: boolean;
}

function LiveSpecEditor({
    liveSpecEditorStoreName,
    useZustandStore,
    localZustandScope,
}: Props) {
    return (
        <EditorWithFileSelector
            editorStoreName={liveSpecEditorStoreName}
            useZustandStore={useZustandStore}
            localZustandScope={localZustandScope}
            disabled={true}
        />
    );
}

export default LiveSpecEditor;
