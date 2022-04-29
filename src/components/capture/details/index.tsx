import { routeDetails } from 'app/Authenticated';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import PageContainer from 'components/shared/PageContainer';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { TABLES } from 'services/supabase';

export interface LiveSpecQuery {
    id: string;
    catalog_name: string;
    last_pub_id: string;
    spec: string;
    spec_type: string;
    connector_image_name: string;
    connector_image_tag: string;
}

const LIVE_SPECS_QUERY = `
    id, 
    catalog_name,
    last_pub_id,
    spec,
    spec_type,
    connector_image_name,
    connector_image_tag
`;

function CaptureDetails() {
    useBrowserTitle('browserTitle.captureDetails');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pubID = searchParams.get(routeDetails.capture.details.params.pubID);
    if (!pubID) navigate(routeDetails.dashboard.path);

    // Supabase stuff
    const liveSpecQuery = useQuery<LiveSpecQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: LIVE_SPECS_QUERY,
            filter: (query) => query.eq('last_pub_id', pubID as string),
        },
        []
    );
    const { data: liveSpecs } = useSelect(liveSpecQuery);

    const setSpecs = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['setId']
    >((state) => state.setId);

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
            <LiveSpecEditor />
        </PageContainer>
    );
}

export default CaptureDetails;
