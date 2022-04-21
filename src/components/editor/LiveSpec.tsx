import { Box } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import EditorFileSelector from 'components/editor/FileSelector';
import MonacoEditor from 'components/editor/MonacoEditor';
import { useZustandStore } from 'components/editor/Store';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TABLES } from 'services/supabase';

export interface LiveSpec {
    id: string;
    catalog_name: string;
    last_pub_id: string;
    spec: string;
    spec_type: string;
    reads_from: string;
    writes_to: string;
    connector_image_name: string;
    connector_image_tag: string;
}
const LIVE_SPECS_QUERY = `
    id, 
    catalog_name,
    last_pub_id,
    spec,
    spec_type,
    reads_from,
    writes_to,
    connector_image_name,
    connector_image_tag
`;

function LiveSpecEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pubID = searchParams.get(routeDetails.capture.details.params.pubID);
    if (!pubID) navigate(routeDetails.home.path);

    const { setSpecs, setId, currentCatalog, specs } =
        useZustandStore<LiveSpec>();
    const [liveSpec, setLiveSpec] = useState<LiveSpec['spec'] | null>(null);

    // Supabase stuff
    const liveSpecQuery = useQuery<LiveSpec>(
        TABLES.LIVE_SPECS,
        {
            columns: LIVE_SPECS_QUERY,
            filter: (query) => query.eq('last_pub_id', pubID as string),
        },
        []
    );
    const { data: liveSpecs } = useSelect(liveSpecQuery);

    useEffect(() => {
        setId(pubID);
    }, [pubID, setId]);

    useEffect(() => {
        if (liveSpecs?.data) {
            setSpecs(liveSpecs.data);
        }
    }, [liveSpecs, setSpecs]);

    useEffect(() => {
        console.log('current catalog ueh', {
            currentCatalog,
            specs,
        });
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
