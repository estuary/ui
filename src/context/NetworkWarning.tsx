import { Stack, Typography } from '@mui/material';
import { Wifi, WifiOff } from 'iconoir-react';
import { debounce } from 'lodash';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNetworkState } from 'react-use';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { BaseComponentProps } from 'types';
import { snackbarSettings } from 'utils/notification-utils';

// We give the browser some wiggle room before showing a message so quick disturbances
//  do not get displayed
const WAIT_TIME = 2000;

function NetworkWarning({ children }: BaseComponentProps) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { previous, online } = useNetworkState();

    const networkDownSnackbar = useRef<SnackbarKey | null>(null);

    const debouncedNotification = useRef(
        debounce((old: boolean | undefined, curr: boolean | undefined) => {
            // This is mainly for the "on load" of the page and we can ignore everything the first time
            if (old === undefined) {
                return;
            }

            if (!curr) {
                // There is a solid chance this will not actually make it to LR... but want this here
                //  just in case we start showing this to folks that are not having network issues.
                logRocketEvent(CustomEvents.NOTIFICATION_NETWORK_WARNING);

                networkDownSnackbar.current = enqueueSnackbar(
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center' }}
                    >
                        <Typography>
                            <WifiOff />
                        </Typography>
                        <Typography>
                            <FormattedMessage id="notifications.networkState.down" />
                        </Typography>
                    </Stack>,
                    {
                        ...snackbarSettings,
                        hideIconVariant: true,
                        variant: 'warning',
                    }
                );
            }

            // If we previously showed them the network is down then go ahead and show them it came back up
            //  Otherwise, it went down and came back up before we could notify them so we don't need to show the good news
            if (networkDownSnackbar.current && curr) {
                // Close any previous messages as reset the ref
                if (networkDownSnackbar.current) {
                    closeSnackbar(networkDownSnackbar.current);
                    networkDownSnackbar.current = null;
                }

                enqueueSnackbar(
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center' }}
                    >
                        <Typography>
                            <Wifi />
                        </Typography>
                        <Typography>
                            <FormattedMessage id="notifications.networkState.restored" />
                        </Typography>
                    </Stack>,
                    {
                        ...snackbarSettings,
                        hideIconVariant: true,
                        variant: 'success',
                    }
                );
            }
        }, WAIT_TIME)
    );

    useEffect(() => {
        debouncedNotification.current(previous, online);
    }, [online, previous]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default NetworkWarning;
