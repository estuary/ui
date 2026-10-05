import { useEffect, useState } from 'react';

import { Popover } from '@mui/material';

import { ReloadWindow } from 'iconoir-react';
import useSWR from 'swr';

import { getLatestVersionDetails } from 'src/api/meta';
import { NavButton } from 'src/components/navigation/NavItems';
import Actions from 'src/components/UpdateAlert/Actions';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface UpdateAlertProps {
    isOpen?: boolean;
}

// Sidebar item that appears when the served meta.json commit no longer
// matches the commit baked into this bundle, meaning a newer version of
// the dashboard has been deployed since this tab loaded.
export function UpdateAlert({ isOpen }: UpdateAlertProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const [hasLatest, setHasLatest] = useState<boolean>(true);

    const { data } = useSWR(
        hasLatest ? 'meta.json' : null,
        getLatestVersionDetails,
        {
            revalidateOnFocus: true,
        }
    );

    useEffect(() => {
        if (!data) {
            return;
        }

        if (data.commitId !== __ESTUARY_UI_COMMIT_ID__) {
            setHasLatest(false);
            logRocketEvent(CustomEvents.UPDATE_AVAILABLE, {
                commitId: data.commitId,
                commitDate: data.commitDate,
            });
        }
    }, [data]);

    if (hasLatest) {
        return null;
    }

    return (
        <>
            <NavButton
                icon={<ReloadWindow />}
                title="Update"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                isOpen={isOpen}
            />
            <Popover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'top',
                }}
                transformOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom',
                }}
            >
                <Actions />
            </Popover>
        </>
    );
}
