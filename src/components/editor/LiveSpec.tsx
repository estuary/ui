import { useMemo } from 'react';

import EditorWithFileSelector from 'src/components/editor/EditorWithFileSelector';
import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import { stringifyJSON } from 'src/services/stringify';

interface Props {
    localZustandScope: boolean;
    singleSpec?: boolean;
    height?: number;
}

function LiveSpecEditor({ localZustandScope, height, singleSpec }: Props) {
    const currentCatalog = useEditorStore_currentCatalog({
        localScope: localZustandScope,
    });

    const specAsString = useMemo(
        () => stringifyJSON(currentCatalog?.spec ?? null),
        [currentCatalog?.spec]
    );

    return (
        <EditorWithFileSelector
            localZustandScope={localZustandScope}
            defaultValue={specAsString}
            disabled={true}
            disableList={singleSpec}
            height={height}
        />
    );
}

export default LiveSpecEditor;
