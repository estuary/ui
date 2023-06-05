import { Box } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import useDirectiveGuard from 'app/guards/hooks';
import MessageWithButton from 'components/content/MessageWithButton';
import Error from 'components/shared/Error';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import { Dispatch, SetStateAction, useState } from 'react';
import { jobStatusPoller } from 'services/supabase';
import { useEntitiesStore_mutate } from 'stores/Entities/hooks';

interface Props {
    tenant: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    goToFilteredTable: () => void;
}

const directiveName = 'acceptDemoTenant';

function AcceptDemoInvitation({ tenant, setOpen, goToFilteredTable }: Props) {
    const { directive, mutate } = useDirectiveGuard(directiveName, {
        hideAlert: true,
    });

    const mutateAuthRoles = useEntitiesStore_mutate();

    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const applyDirective = async (): Promise<void> => {
        if (directive) {
            const response = await submitDirective(
                directiveName,
                directive,
                tenant
            );

            if (response.error) {
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
                            mutateAuthRoles();
                        }

                        setOpen(false);
                        goToFilteredTable();
                    });
                },
                async (payload: any) => {
                    trackEvent(`${directiveName}:Error`, directive);

                    setServerError(payload.job_status.error);
                }
            );
        }
    };

    return (
        <>
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
                    sharableTenant: <b>demo/</b>,
                    userTenant: <b>{tenant}</b>,
                }}
                clickHandler={applyDirective}
            />
        </>
    );
}

export default AcceptDemoInvitation;
