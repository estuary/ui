import EditorWithFileSelector from 'components/editor/EditorWithFileSelector';
import { CaptureStoreNames, MaterializationStoreNames } from 'hooks/useZustand';

interface Props {
    draftEditorStoreName:
        | CaptureStoreNames.DRAFT_SPEC_EDITOR
        | MaterializationStoreNames.DRAFT_SPEC_EDITOR;
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
