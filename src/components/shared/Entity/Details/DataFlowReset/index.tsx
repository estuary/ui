import { Button } from '@mui/material';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getLiveSpecFlowBySource } from 'api/liveSpecFlows';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';

function DataFlowReset() {
    const liveSpecId = useEditorStore_id({
        localScope: true,
    });
    const entityType = useEntityType();

    const foo = useQuery(
        liveSpecId
            ? getLiveSpecFlowBySource('0e:86:b1:fa:c1:82:20:00', entityType)
            : null
    );

    console.log('liveSpecId', liveSpecId);
    console.log('foo', foo);

    return <Button>Refresh {entityType}</Button>;
}

export default DataFlowReset;
