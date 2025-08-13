import type { SupportRoleGrantArgs } from 'src/_compliance/types';

import { useCallback } from 'react';

import { mockServerCall } from 'src/_compliance/api/controlPlane';

function useSupportRoleGrant() {
    const supportRoleGrant = useCallback(async (args: SupportRoleGrantArgs) => {
        return mockServerCall({
            data: true,
        });
    }, []);

    return { supportRoleGrant };
}

export default useSupportRoleGrant;
