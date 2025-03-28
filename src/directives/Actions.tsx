import { Button, Toolbar } from '@mui/material';

import { useIntl } from 'react-intl';

import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { supabaseClient } from 'src/context/GlobalProviders';
import type { ActionsProps } from 'src/directives/types';

const Actions = ({ primaryMessageId, saving }: ActionsProps) => {
    const intl = useIntl();

    return (
        <Toolbar
            disableGutters
            sx={{
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Button
                disabled={saving}
                variant="outlined"
                onClick={async () => {
                    await supabaseClient.auth.signOut();
                }}
            >
                {intl.formatMessage({ id: 'cta.cancel' })}
            </Button>
            <SafeLoadingButton
                type="submit"
                variant="contained"
                loading={saving}
                disabled={saving}
            >
                {intl.formatMessage({
                    id: primaryMessageId,
                })}
            </SafeLoadingButton>
        </Toolbar>
    );
};

export default Actions;
