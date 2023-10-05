import { Stack, Switch, Typography } from '@mui/material';
import { getNotificationMessageByName } from 'api/alerts';
import { defaultOutline } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import {
    MouseEvent as ReactMouseEvent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    headerId: string;
    labelId: string;
    messageName: string;
    liveSpecId: string | null;
    preferenceId: string | null;
    notificationSettings: any | null;
    hideBorder?: boolean;
}

function SwitchSetting({
    headerId,
    labelId,
    liveSpecId,
    preferenceId,
    messageName,
    notificationSettings,
    hideBorder,
}: Props) {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [notificationId, setNotificationId] = useState<string | null>(null);
    const [messageId, setMessageId] = useState<string | null>(null);

    const { getNotificationSubscription } =
        useInitializeTaskNotification(catalogName);

    useEffect(() => {
        getNotificationMessageByName(messageName).then(
            (response) => {
                if (response.data && response.data.length > 0) {
                    setMessageId(response.data[0].id);
                }
            },
            () => {
                console.log('init message error');
            }
        );
    }, [messageName, setMessageId]);

    useEffect(() => {
        if (liveSpecId && preferenceId && messageId) {
            getNotificationSubscription(
                messageName,
                liveSpecId,
                preferenceId,
                notificationSettings
            ).then(
                (response) => {
                    console.log('init switch success', response);

                    if (response.data) {
                        setNotificationId(response.data.notificationId);
                        setMessageId(response.data.messageId);
                    }
                },
                () => {
                    console.log('init switch error');
                }
            );
        }
    }, [
        liveSpecId,
        messageId,
        messageName,
        preferenceId,
        setMessageId,
        setNotificationId,
    ]);

    const handleClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.preventDefault();
            event.stopPropagation();

            if (notificationId) {
                // Delete
            } else if (liveSpecId && preferenceId && messageId) {
            }

            if (liveSpecId && preferenceId) {
                getNotificationSubscription(
                    messageName,
                    liveSpecId,
                    preferenceId,
                    notificationSettings
                ).then(
                    (response) => {
                        console.log('success', response);
                    },
                    () => {
                        console.log('error');
                    }
                );
            }
        },
        [liveSpecId, notificationId, notificationSettings, preferenceId]
    );

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                py: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: hideBorder
                    ? 'none'
                    : (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            <Stack spacing={1}>
                <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                    <FormattedMessage id={headerId} />
                </Typography>

                <Typography>
                    <FormattedMessage id={labelId} />
                </Typography>
            </Stack>

            <Switch
                size="small"
                value={hasLength(notificationId)}
                checked={hasLength(notificationId)}
                disabled={!liveSpecId || !preferenceId}
                onClick={handleClick}
            />
        </Stack>
    );
}

export default SwitchSetting;
