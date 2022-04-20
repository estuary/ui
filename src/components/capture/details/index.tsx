import { routeDetails } from 'app/Authenticated';
import LiveSpecEditor from 'components/editor/LiveSpec';
import {
    createEditorStore,
    EditorStoreProvider,
    editorStoreSelectors,
} from 'components/editor/Store';
import PageContainer from 'components/shared/PageContainer';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { useTitle } from 'react-use';
import { TABLES } from 'services/supabase';

export interface LiveSpecs {
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

function CaptureDetails() {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.captureDetails',
        })
    );

    const [searchParams] = useSearchParams();
    const pubID = searchParams.get(routeDetails.capture.details.params.pubID);

    const useLiveStore = createEditorStore('liveSpecEditor');
    const setSpecs = useLiveStore(editorStoreSelectors.setSpecs);
    const setId = useLiveStore(editorStoreSelectors.setId);

    // Supabase stuff
    const liveSpecQuery = useQuery<LiveSpecs>(
        TABLES.LIVE_SPECS,
        {
            columns: LIVE_SPECS_QUERY,
            filter: (query) =>
                query.eq('last_pub_id', pubID ? pubID : '--missing-pub_id--'),
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

    return (
        <PageContainer>
            <EditorStoreProvider createStore={() => useLiveStore}>
                <LiveSpecEditor />
            </EditorStoreProvider>
        </PageContainer>
    );
}

export default CaptureDetails;
