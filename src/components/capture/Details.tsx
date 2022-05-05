import { Grid } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { EditorStoreState } from 'components/editor/Store';
import Error from 'components/shared/Error';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect } from 'react';
import { TABLES } from 'services/supabase';

export interface LiveSpecQuery {
    pub_id: string;
    live_spec_id: string;
    published_at: string;
    // publications: {
    //     id: string;
    //     job_status: JobStatus;
    //     logs_token: string;
    // }[];
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
    pub_id,
    live_spec_id,
    published_at,
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
// publications (
//     id,
//     job_status,
//     logs_token
// )

interface Props {
    lastPubId: string;
}

function CaptureDetails({ lastPubId }: Props) {
    useBrowserTitle('browserTitle.captureDetails');

    // Supabase stuff
    const query = useQuery<LiveSpecQuery>(
        TABLES.PUBLICATION_SPECS,
        {
            columns: QUERY,
            filter: (filterBuilder) => filterBuilder.eq('pub_id', lastPubId),
        },
        []
    );
    const { data: liveSpecs, error } = useSelect<LiveSpecQuery>(query);

    const setSpecs = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<LiveSpecQuery>,
        EditorStoreState<LiveSpecQuery>['setId']
    >((state) => state.setId);

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (liveSpecs?.data) {
            setSpecs(liveSpecs.data.map((item) => item.live_specs));
        }
    }, [liveSpecs, setSpecs]);

    if (error) {
        return <Error error={error} />;
    } else {
        return (
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <LiveSpecEditor />
                </Grid>
                {/* {liveSpecs?.data.publications[0].logs_token ? (
                    <Grid item xs={6}>
                        <Typography variant="h5">
                            <FormattedMessage id="captureDetails.logs.title" />
                        </Typography>
                        <Logs
                            token={liveSpecs.data.publications[0].logs_token}
                            fetchAll
                            disableIntervalFetching
                        />
                    </Grid>
                ) : null} */}
            </Grid>
        );
    }
}

export default CaptureDetails;
