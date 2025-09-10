import type { HydrationErrorAlertProps } from 'src/components/shared/Entity/Details/Ops/types';

import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import FragmentStoreUnhealthy from 'src/components/shared/Entity/Details/Ops/CustomErrors/FragmentStoreUnhealthy';
import OffsetNotYetAvailable from 'src/components/shared/Entity/Details/Ops/CustomErrors/OffsetNotYetAvailable';
import Message from 'src/components/shared/Error/Message';
import { BASE_ERROR } from 'src/services/supabase';

function HydrationErrorAlert({ hydrationError }: HydrationErrorAlertProps) {
    const intl = useIntl();

    return useMemo(() => {
        if (!hydrationError) {
            return null;
        }

        return (
            <AlertBox
                severity="error"
                title={intl.formatMessage({
                    id: 'ops.logsTable.hydrationError',
                })}
                short
                sx={{
                    maxWidth: 'fit-content',
                }}
            >
                {hydrationError === 'OFFSET_NOT_YET_AVAILABLE' ? (
                    <OffsetNotYetAvailable />
                ) : hydrationError === 'FRAGMENT_STORE_UNHEALTHY' ? (
                    <FragmentStoreUnhealthy />
                ) : (
                    <Message
                        error={{
                            ...BASE_ERROR,
                            message: hydrationError,
                        }}
                    />
                )}
            </AlertBox>
        );
    }, [hydrationError, intl]);
}

export default HydrationErrorAlert;
