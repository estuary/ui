import type { HydrationErrorProps } from 'src/components/shared/Entity/Shard/types';

import AlertBox from 'src/components/shared/AlertBox';
import Message from 'src/components/shared/Error/Message';

function HydrationError({ error }: HydrationErrorProps) {
    return (
        <AlertBox severity="error" short title="Unable to fetch shard status">
            <Message error={error} />
        </AlertBox>
    );
}

export default HydrationError;
