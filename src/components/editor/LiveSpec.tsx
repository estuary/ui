import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { DraftEditorStoreNames } from 'hooks/useZustand';

interface Props {
    draftEditorStoreName: DraftEditorStoreNames;
}

function LiveSpecEditor({ draftEditorStoreName }: Props) {
    return (
        <EditorWithFileSelector
            draftEditorStoreName={draftEditorStoreName}
            disabled={true}
        />
    );
}

export default LiveSpecEditor;
