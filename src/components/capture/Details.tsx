import { Grid, Typography } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { EditorStoreState } from 'components/editor/Store';
import Logs from 'components/Logs';
import Error from 'components/shared/Error';
import { useQuery, useSelect, useSelectSingle } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';

export interface PubSpecQuery {
    pub_id: string;
    live_spec_id: string;
    published_at: string;
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

const PUB_SPEC_QUERY = `
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

export interface PubsQuery {
    id: string;
    logs_token: string;
}

const PUBS_QUERY = `
id,
logs_token
`;

interface Props {
    lastPubId: string;
}

function CaptureDetails({ lastPubId }: Props) {
    useBrowserTitle('browserTitle.captureDetails');

    // Supabase stuff
    const pubSpecQuery = useQuery<PubSpecQuery>(
        TABLES.PUBLICATION_SPECS,
        {
            columns: PUB_SPEC_QUERY,
            filter: (filterBuilder) => filterBuilder.eq('pub_id', lastPubId),
        },
        []
    );
    const pubsQuery = useQuery<PubsQuery>(
        TABLES.PUBLICATIONS,
        {
            columns: PUBS_QUERY,
            filter: (filterBuilder) => filterBuilder.eq('id', lastPubId),
        },
        []
    );
    const { data: pubSpecs, error: pubSpecsError } =
        useSelect<PubSpecQuery>(pubSpecQuery);
    const { data: pubs, error: pubsError } =
        useSelectSingle<PubsQuery>(pubsQuery);

    const setSpecs = useZustandStore<
        EditorStoreState<PubSpecQuery>,
        EditorStoreState<PubSpecQuery>['setSpecs']
    >((state) => state.setSpecs);

    const setId = useZustandStore<
        EditorStoreState<PubSpecQuery>,
        EditorStoreState<PubSpecQuery>['setId']
    >((state) => state.setId);

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (pubSpecs?.data) {
            setSpecs(pubSpecs.data.map((item) => item.live_specs));
        }
    }, [pubSpecs, setSpecs]);

    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    } else {
        return (
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <LiveSpecEditor />
                </Grid>

                {pubsError ? (
                    <Error error={pubsError} />
                ) : pubs?.data ? (
                    <Grid item xs={6}>
                        <Typography variant="h5">
                            <FormattedMessage id="captureDetails.logs.title" />
                        </Typography>
                        <Logs
                            token={pubs.data.logs_token}
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
