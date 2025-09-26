import type { HydrationErrorProps } from 'src/components/shared/Entity/Shard/types';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import Message from 'src/components/shared/Error/Message';

function HydrationError({ error }: HydrationErrorProps) {
    const intl = useIntl();

    return (
        <AlertBox
            severity="error"
            short
            title={intl.formatMessage({
                id: 'detailsPanel.shardDetails.fetchError',
            })}
        >
            <Message error={error} />
        </AlertBox>
    );
}

export default HydrationError;
