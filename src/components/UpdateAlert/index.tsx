import { getLatestVersionDetails } from 'api/meta';
import ButtonWithPopper from 'components/shared/buttons/ButtonWithPopper';
import { NavArrowDown } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import useSWR from 'swr';
import Actions from './Actions';

export function UpdateAlert() {
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
        <ButtonWithPopper
            messageId="updateAlert.cta"
            popper={<Actions />}
            buttonProps={{
                endIcon: <NavArrowDown />,
                size: 'small',
                sx: {
                    p: 1,
                    mr: 2,
                },
                variant: 'outlined',
            }}
            popperProps={{
                placement: 'bottom-end',
            }}
        />
    );
}
