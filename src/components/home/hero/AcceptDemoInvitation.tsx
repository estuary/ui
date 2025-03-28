import { Dispatch, SetStateAction, useState } from 'react';

import { Box, Stack } from '@mui/material';

import { PostgrestError } from '@supabase/postgrest-js';

import { submitDirective } from 'src/api/directives';
import useDirectiveGuard from 'src/app/guards/hooks';
import MessageWithButton from 'src/components/content/MessageWithButton';
import Error from 'src/components/shared/Error';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { jobStatusQuery, trackEvent } from 'src/directives/shared';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { DEMO_TENANT } from 'src/utils/misc-utils';

interface Props {
    tenant: string;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
    goToFilteredTable: () => void;
}

const directiveName = 'acceptDemoTenant';

function AcceptDemoInvitation({
    tenant,
    loading,
    setLoading,
    setOpen,
    goToFilteredTable,
}: Props) {
    const { directive, mutate } = useDirectiveGuard(directiveName, {
        hideAlert: true,
    });

    const setHasDemoAccess = useUserInfoSummaryStore(
        (state) => state.setHasDemoAccess
    );

    const { jobStatusPoller } = useJobStatusPoller();

    const mutateAuthRoles = useEntitiesStore((state) => state.mutate);

    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const applyDirective = async (): Promise<void> => {
        if (directive) {
            setLoading(true);

            const response = await submitDirective(
                directiveName,
                directive,
                tenant
            );

            if (response.error) {
                setLoading(false);
                return setServerError(response.error as PostgrestError);
            }

            const data = response.data[0];

            jobStatusPoller(
                jobStatusQuery(data),
                async () => {
                    trackEvent(`${directiveName}:Complete`, directive);

                    setServerError(null);

                    void mutate().finally(() => {
                        if (mutateAuthRoles) {
                            void mutateAuthRoles();
                        }

                        setHasDemoAccess(true);
                        setLoading(false);
                        setOpen(false);
                        goToFilteredTable();
                    });
                },
                async (payload: any) => {
                    trackEvent(`${directiveName}:Error`, directive);

                    setLoading(false);
                    setServerError(payload.job_status.error);
                }
            );
        }
    };

    return (
        <Stack>
            {serverError ? (
                <Box sx={{ mb: 3 }}>
                    <Error
                        error={serverError}
                        condensed={true}
                        hideTitle={true}
                    />
                </Box>
            ) : null}

            <MessageWithButton
                messageId="home.hero.demo.demoTenant"
                messageValues={{
                    sharableTenant: <b>{DEMO_TENANT}</b>,
                    userTenant: <b>{tenant}</b>,
                }}
                clickHandler={applyDirective}
                disabled={loading}
            />
        </Stack>
    );
}

export default AcceptDemoInvitation;
