import { debounce } from 'lodash';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useNetworkState } from 'react-use';
import { BaseComponentProps } from 'types';
import { snackbarSettings } from 'utils/notification-utils';

// We give the browser some wiggle room before showing a message so quick disturbances
//  do not get displayed
const WAIT_TIME = 2000;

function NetworkWarning({ children }: BaseComponentProps) {
    const intl = useIntl();
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
                networkDownSnackbar.current = enqueueSnackbar(
                    intl.formatMessage({
                        id: 'notifications.networkState.down',
                    }),
                    {
                        ...snackbarSettings,
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
                    intl.formatMessage({
                        id: 'notifications.networkState.restored',
                    }),
                    {
                        ...snackbarSettings,
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
