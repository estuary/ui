import { useCallback } from 'react';
import { useIntl } from 'react-intl';

function useCidrBlocks() {
    const intl = useIntl();

    return useCallback(
        (cidrBlocks: null | undefined | string[]) => {
            if (cidrBlocks && cidrBlocks.length > 0) {
                return cidrBlocks.join(', ');
            }

            return intl.formatMessage({
                id: 'informational.sshEndpoint.ip',
            });
        },
        [intl]
    );
}

export default useCidrBlocks;
