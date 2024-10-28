import { getLatestVersionDetails } from 'api/meta';
import ButtonWithPopper from 'components/shared/buttons/ButtonWithPopper';
import { NavArrowDown } from 'iconoir-react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import useSWR from 'swr';
import Actions from './Actions';

export function UpdateAlert() {
    const intl = useIntl();

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
            popper={<Actions />}
            buttonProps={{
                endIcon: <NavArrowDown style={{ fontSize: 13 }} />,
                size: 'small',
                sx: {
                    alignItems: 'center',
                    p: 1,
                    mr: 2,
                },
                variant: 'text',
            }}
            popperProps={{
                placement: 'bottom-end',
            }}
        >
            {intl.formatMessage({ id: 'updateAlert.cta' })}
        </ButtonWithPopper>
    );
}
