import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import ServerError from 'src/components/shared/Entity/Details/Alerts/Details/ServerError';
import KeyValueList from 'src/components/shared/KeyValueList';

function ShardFailedDetail(props: AlertDetailsProps) {
    const { details } = props;

    return (
        <KeyValueList
            data={[
                {
                    title: details[0].label,
                    val: <ServerError {...props} />,
                },
            ]}
        />
    );
}

export default ShardFailedDetail;
