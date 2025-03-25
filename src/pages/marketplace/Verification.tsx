import type { PostgrestError } from '@supabase/postgrest-js';
import { Box, Stack, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';

import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate } from 'react-router';
import PrefixedName from 'components/inputs/PrefixedName';
import Error from 'components/shared/Error';
import useMarketplaceVerify from 'hooks/useMarketplaceVerify';
import { BASE_ERROR } from 'services/supabase';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import FullPageWrapper from 'app/FullPageWrapper';
import useMarketplaceLocalStorage from 'hooks/useMarketplaceLocalStorage';
import useConstant from 'use-constant';
import SafeLoadingButton from 'components/SafeLoadingButton';

function MarketplaceVerification() {
    const intl = useIntl();
    const verifyMarketplace = useMarketplaceVerify();

    const { 0: marketplaceVerify, 2: removeMarketplaceVerify } =
        useMarketplaceLocalStorage();

    const skip = useConstant(() => Boolean(!marketplaceVerify));

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
        console.log('MarketplaceVerification:error', error);
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
                removeMarketplaceVerify();
                setApplied(true);
            }, handleFailure);
        },
        [handleFailure, removeMarketplaceVerify, verifyMarketplace]
    );

    if (applied || skip) {
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
                    <SafeLoadingButton
                        variant="contained"
                        loading={loading}
                        disabled={Boolean(prefixHasErrors || loading)}
                        onClick={() => startVerification(prefix)}
                        sx={{ mt: 2 }}
                    >
                        <FormattedMessage id="cta.continue" />
                    </SafeLoadingButton>
                </Box>
            </Stack>
        </FullPageWrapper>
    );
}

export default MarketplaceVerification;
