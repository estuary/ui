import type { HydrationErrorAlertProps } from 'src/components/shared/Entity/Details/Ops/types';

import { useMemo } from 'react';

import AlertBox from 'src/components/shared/AlertBox';
import Message from 'src/components/shared/Error/Message';
import { BASE_ERROR } from 'src/services/supabase';

function HydrationErrorAlert({ hydrationError }: HydrationErrorAlertProps) {
    return useMemo(() => {
        if (!hydrationError) {
            return null;
        }

        return (
            <AlertBox
                severity="error"
                title="We encountered a problem retrieving logs."
                short
                sx={{
                    maxWidth: 'fit-content',
                }}
            >
                <Message
                    error={{
                        ...BASE_ERROR,
                        message: hydrationError,
                    }}
                />
            </AlertBox>
        );
    }, [hydrationError]);
}

export default HydrationErrorAlert;
