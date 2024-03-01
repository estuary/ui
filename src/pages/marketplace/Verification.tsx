import { Box, Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { authenticatedRoutes } from 'app/routes';

import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate } from 'react-router';
import { LoadingButton } from '@mui/lab';
import PrefixedName from 'components/inputs/PrefixedName';
import Error from 'components/shared/Error';
import useMarketplaceVerify from 'hooks/useMarketplaceVerify';
import { BASE_ERROR } from 'services/supabase';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import FullPageWrapper from 'app/FullPageWrapper';
import { useMount } from 'react-use';
import useMarketplaceLocalStorage from 'hooks/useMarketplaceLocalStorage';

function MarketplaceVerification() {
    const intl = useIntl();
    const verifyMarketplace = useMarketplaceVerify();

    const { 2: removeMarketplaceVerify } = useMarketplaceLocalStorage();

    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const [prefix, setPrefix] = useState('');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const updatePrefix = (value: string, errors: string | null) => {
        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));
    };

    const handleFailure = useCallback((error: PostgrestError) => {
        console.log('error', error);
        setLoading(false);
        setApplied(false);
        setServerError(error);
        logRocketEvent(CustomEvents.MARKETPLACE_VERIFY, {
            status: 'failed',
            message: error.message,
        });
    }, []);

    const startVerification = useCallback(
        (tenant: string) => {
            setLoading(true);
            setServerError(null);
            verifyMarketplace(tenant).then(() => {
                // There is no data returned with this call - just an ok
                logRocketEvent(CustomEvents.MARKETPLACE_VERIFY, {
                    status: 'success',
                    message: null,
                });
                setApplied(true);
            }, handleFailure);
        },
        [handleFailure, verifyMarketplace]
    );

    useMount(() => {
        removeMarketplaceVerify();
    });

    if (applied) {
        return <Navigate to={authenticatedRoutes.home.path} replace />;
    }

    return (
        <FullPageWrapper>
            <Stack spacing={2}>
                {serverError ? (
                    <Error
                        error={{ ...BASE_ERROR, message: serverError.message }}
                        condensed
                    />
                ) : null}

                <Typography variant="h5" align="center">
                    <FormattedMessage id="tenant.marketplace.header" />
                </Typography>

                <Typography>
                    <FormattedMessage id="tenant.marketplace.message" />
                </Typography>

                <Box>
                    <PrefixedName
                        label={intl.formatMessage({
                            id: 'common.tenant',
                        })}
                        onChange={updatePrefix}
                        prefixOnly
                        hideErrorMessage
                        required
                        size="small"
                        validateOnLoad
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <LoadingButton
                        variant="contained"
                        loading={loading}
                        disabled={Boolean(prefixHasErrors || loading)}
                        onClick={() => startVerification(prefix)}
                        sx={{ mt: 2 }}
                    >
                        <span>
                            <FormattedMessage id="cta.continue" />
                        </span>
                    </LoadingButton>
                </Box>
            </Stack>
        </FullPageWrapper>
    );
}

export default MarketplaceVerification;
