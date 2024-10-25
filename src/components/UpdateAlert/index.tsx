import { MenuItem } from '@mui/material';
import { getLatestVersionDetails } from 'api/meta';
import IconMenu from 'components/menus/IconMenu';
import { ReloadWindow } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

export function UpdateAlert() {
    const intl = useIntl();
    const [hasLatest, setHasLatest] = useState(true);

    const { data } = useSWR('meta.json', getLatestVersionDetails, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 6000,
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        if (data.commitId !== __ESTUARY_UI_COMMIT_ID__) {
            setHasLatest(false);
        }
    }, [data]);

    if (hasLatest) {
        return null;
    }

    return (
        <IconMenu
            ariaLabel={intl.formatMessage({ id: 'helpMenu.ariaLabel' })}
            icon={<ReloadWindow />}
            identifier="help-menu"
            tooltip={intl.formatMessage({ id: 'helpMenu.tooltip' })}
        >
            <MenuItem tabIndex={0} onClick={() => window.location.reload()}>
                Reload - unsaved work will be lost
            </MenuItem>
        </IconMenu>
    );
}
