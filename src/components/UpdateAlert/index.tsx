import { getLatestVersionDetails } from 'api/meta';
import { useEffect, useState } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import useSWR from 'swr';

export function UpdateAlert() {
    // const intl = useIntl();

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

    // Pushing to production with this commented out first to be safe
    return null;
    // return (
    //     <Box sx={{ display: 'flex' }}>
    //         <ButtonWithPopper
    //             popper={<Actions />}
    //             buttonProps={{
    //                 endIcon: <NavArrowDown style={{ fontSize: 13 }} />,
    //                 size: 'small',
    //                 sx: {
    //                     alignItems: 'center',
    //                     p: 1,
    //                 },
    //                 variant: 'text',
    //             }}
    //             popperProps={{
    //                 placement: 'bottom-end',
    //             }}
    //         >
    //             {intl.formatMessage({ id: 'updateAlert.cta' })}
    //         </ButtonWithPopper>
    //         <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 2 }} />
    //     </Box>
    // );
}
