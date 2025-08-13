import type { SupportRoleGrantArgs } from 'src/_compliance/types';

import { useCallback } from 'react';

import { mockServerCall } from 'src/_compliance/api/controlPlane';

function useAddSupportRoleGrant() {
    const addSupportRoleGrant = useCallback(
        async (args: SupportRoleGrantArgs) => {
            return mockServerCall({
                data: true,
            });
        },
        []
    );

    return { addSupportRoleGrant };
}

export default useAddSupportRoleGrant;
