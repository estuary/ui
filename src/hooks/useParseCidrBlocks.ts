import { useCallback } from 'react';

const useParseCidrBlocks = () => {
    return useCallback((cidrBlocks: null | undefined | string[]) => {
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
            ipv4: '35.226.75.135',
            ipv6: 'does not support IPv6',
        };
    }, []);
};

export default useParseCidrBlocks;
