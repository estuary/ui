import type { SxProps, Theme } from '@mui/material';
import { useMemo } from 'react';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';

function useHideStatsColumnsSxSx() {
    const hasAnyAccess = useUserInfoSummaryStore((state) => state.hasAnyAccess);

    return useMemo<SxProps<Theme>>(
        () =>
            hasAnyAccess
                ? {}
                : {
                      display: 'none',
                      width: 0,
                  },
        [hasAnyAccess]
    );
}

export default useHideStatsColumnsSxSx;
