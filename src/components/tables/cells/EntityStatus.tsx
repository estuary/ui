import { Tooltip } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { getStore } from 'stores/Repo';
import { shardDetailSelectors } from 'stores/ShardDetail';

interface Props {
    name: string;
}

function EntityStatus({ name }: Props) {
    const shardDetailStore = getStore(useRouteStore());
    const getShardStatus = shardDetailStore(
        shardDetailSelectors.getShardStatus
    );

    return (
        <Tooltip title="Status" placement="bottom-start">
            <span
                style={{
                    height: 16,
                    width: 16,
                    backgroundColor: getShardStatus(name),
                    borderRadius: 50,
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: 12,
                }}
            />
        </Tooltip>
    );
}

export default EntityStatus;
