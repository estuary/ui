import { useTenantDetails } from 'context/fetcher/Tenant';
import { useMemo } from 'react';
import { SxProps, Theme } from '@mui/material';

function useHideStatsColumnsSxSx() {
    const { hasTenants } = useTenantDetails();

    return useMemo<SxProps<Theme>>(
        () =>
            hasTenants
                ? {}
                : {
                      display: 'none',
                      width: 0,
                  },
        [hasTenants]
    );
}

export default useHideStatsColumnsSxSx;
