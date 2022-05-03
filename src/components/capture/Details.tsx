import { Grid, Typography } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import { useQuery, useSelectSingle } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
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

interface Props {
    lastPubId: string;
}

function CaptureDetails({ lastPubId }: Props) {
    useBrowserTitle('browserTitle.captureDetails');

    // Supabase stuff
    const query = useQuery<LiveSpecQuery>(
        TABLES.PUBLICATIONS,
        {
            columns: QUERY,
            filter: (filterBuilder) => filterBuilder.eq('id', lastPubId),
        },
        []
    );
    const { data: liveSpecs, error } = useSelectSingle<LiveSpecQuery>(query);

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
            setSpecs(liveSpecs.data.live_specs);
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
                {liveSpecs?.data.logs_token ? (
                    <Grid item xs={6}>
                        <Typography variant="h5">
                            <FormattedMessage id="captureDetails.logs.title" />
                        </Typography>
                        <Logs
                            token={liveSpecs.data.logs_token}
                            fetchAll
                            disableIntervalFetching
                        />
                    </Grid>
                ) : null}
            </Grid>
        );
    }
}

export default CaptureDetails;
