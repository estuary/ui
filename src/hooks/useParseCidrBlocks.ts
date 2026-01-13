import { useCallback } from 'react';

import { useIntl } from 'react-intl';

const useParseCidrBlocks = () => {
    const intl = useIntl();

    return useCallback(
        (cidrBlocks: null | undefined | string[]) => {
            if (cidrBlocks && cidrBlocks.length > 0) {
                const ipv4: string[] = [];
                const ipv6: string[] = [];

                cidrBlocks.forEach((cidrBlock) => {
                    if (cidrBlock.length < 1) {
                        return;
                    }

                    if (cidrBlock.includes(':')) {
                        ipv6.push(cidrBlock);
                        return;
                    }

                    ipv4.push(cidrBlock);
                });

                return {
                    ipv4: ipv4.length > 0 ? ipv4.join(', ') : null,
                    ipv6: ipv6.length > 0 ? ipv6.join(', ') : null,
                };
            }

            return {
                ipv4: intl.formatMessage({
                    id: 'informational.sshEndpoint.ipv4',
                }),
                ipv6: intl.formatMessage({
                    id: 'informational.sshEndpoint.ipv6',
                }),
            };
        },
        [intl]
    );
};

export default useParseCidrBlocks;
