import { Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import Logs from 'components/Logs';
import PageContainer from 'components/shared/PageContainer';
import { useQuery, useSelectSingle } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { TABLES } from 'services/supabase';

export interface LiveSpecQuery {
    id: string;
    job_status: {
        type: string;
    };
    logs_token: string;
    live_specs: {
        id: string;
        catalog_name: string;
        last_pub_id: string;
        spec: any;
        spec_type: string;
        connector_image_name: string;
        connector_image_tag: string;
    }[];
}

const QUERY = `
    id,
    job_status,
    logs_token,
    live_specs (
        id, 
        catalog_name,
        last_pub_id,
        spec,
        spec_type,
        connector_image_name,
        connector_image_tag
    )
`;

function CaptureDetails() {
    useBrowserTitle('browserTitle.captureDetails');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pubID = searchParams.get(routeDetails.capture.details.params.pubID);
    if (!pubID) navigate(routeDetails.dashboard.path);

    // Supabase stuff
    const query = useQuery<LiveSpecQuery>(
        TABLES.PUBLICATIONS,
        {
            columns: QUERY,
            filter: (filterBuilder) => filterBuilder.eq('id', pubID as string),
        },
        []
    );
    const { data: liveSpecs } = useSelectSingle<LiveSpecQuery>(query);

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
            setSpecs(liveSpecs.data.live_specs);
        }
    }, [liveSpecs, setSpecs]);

    return (
        <PageContainer>
            <LiveSpecEditor />
            {liveSpecs?.data.logs_token ? (
                <>
                    <Typography variant="h5">
                        <FormattedMessage id="captureDetails.logs.title" />
                    </Typography>
                    <Logs
                        token={liveSpecs.data.logs_token}
                        fetchAll
                        disableIntervalFetching
                    />
                </>
            ) : null}
        </PageContainer>
    );
}

export default CaptureDetails;
