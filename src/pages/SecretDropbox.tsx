import { useEffect } from 'react';

import { Stack, Typography } from '@mui/material';

import { useSearchParams } from 'react-router-dom';

import { SecretDropboxForm } from 'src/components/secrets/SecretDropboxForm';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import { useUpdateHelmet } from 'src/context/UpdateHelmet';
import { isValidName } from 'src/utils/names';

export function SecretDropbox() {
    const { updateTitle } = useUpdateHelmet();
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');

    useEffect(() => {
        updateTitle('Estuary | Provide a secret');
    }, [updateTitle]);

    return (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CardWrapper sx={{ width: '100%', maxWidth: 560 }}>
                <Stack spacing={3}>
                    <Stack spacing={1}>
                        <Typography variant="h5" component="h1">
                            Provide a secret
                        </Typography>
                        <Typography color="text.secondary">
                            An agent setting up a task asked for this secret.
                        </Typography>
                    </Stack>

                    {isValidName(name) ? (
                        <SecretDropboxForm secretName={name} />
                    ) : (
                        <AlertBox short severity="error">
                            The provided secret name in not valid. Ask your
                            agent for a new link.
                        </AlertBox>
                    )}
                </Stack>
            </CardWrapper>
        </Stack>
    );
}
