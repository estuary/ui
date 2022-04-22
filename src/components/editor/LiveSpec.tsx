import { Box } from '@mui/material';
import { LiveSpecQuery } from 'components/capture/details';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor from 'components/editor/MonacoEditor';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { useEffect, useState } from 'react';

function LiveSpecEditor() {
    const currentCatalog = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['currentCatalog']
    >((state) => state.currentCatalog);

    const specs = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['specs']
    >((state) => state.specs);

    const [liveSpec, setLiveSpec] = useState<LiveSpecQuery['spec'] | null>(
        null
    );

    useEffect(() => {
        if (specs) {
            setLiveSpec(specs[currentCatalog].spec);
        }
    }, [currentCatalog, specs]);

    if (liveSpec) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    height: 300,
                }}
            >
                <EditorFileSelector />
                <MonacoEditor disabled={true} value={liveSpec} path="" />
            </Box>
        );
    } else {
        return null;
    }
}

export default LiveSpecEditor;
