import type { ConsentAuditArgs } from 'src/_compliance/types';

import { useCallback } from 'react';

import { mockServerCall } from 'src/_compliance/api/controlPlane';

function useUpdateAuditTable() {
    const consentAudit = useCallback((args: ConsentAuditArgs) => {
        return mockServerCall({
            data: true,
        });
    }, []);

    return { consentAudit };
}

export default useUpdateAuditTable;
