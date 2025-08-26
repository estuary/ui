import type { PostgrestError } from '@supabase/postgrest-js';

import { useCallback, useState } from 'react';
import useConstant from 'use-constant';

import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate } from 'react-router';

import FullPageWrapper from 'src/app/FullPageWrapper';
import { authenticatedRoutes } from 'src/app/routes';
import PrefixedName from 'src/components/inputs/PrefixedName';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import Error from 'src/components/shared/Error';
import useMarketplaceLocalStorage from 'src/hooks/useMarketplaceLocalStorage';
import useMarketplaceVerify from 'src/hooks/useMarketplaceVerify';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';

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
