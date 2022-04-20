import { TextareaAutosize } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import { useQuery, useSelect } from 'hooks/supabase-swr';
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
    const { data } = useSelect(liveSpecQuery);

    return (
        <PageContainer>
            <TextareaAutosize value={JSON.stringify(data)} />
        </PageContainer>
    );
}

export default CaptureDetails;
