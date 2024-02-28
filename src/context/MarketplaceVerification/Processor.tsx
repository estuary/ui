import { Box, Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { authenticatedRoutes } from 'app/routes';

import { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Navigate } from 'react-router';
import { updateTenantForMarketplace } from 'api/tenants';
import { LoadingButton } from '@mui/lab';
import AlertBox from 'components/shared/AlertBox';
import PrefixedName from 'components/inputs/PrefixedName';

interface Props {
    accountId: string;
}

function MarketplaceVerificationProcessor({ accountId }: Props) {
    const intl = useIntl();

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<PostgrestError | null>(null);

    const [prefix, setPrefix] = useState('');
    const [prefixHasErrors, setPrefixHasErrors] = useState(false);

    const updatePrefix = (value: string, errors: string | null) => {
        setPrefix(value);
        setPrefixHasErrors(Boolean(errors));
    };

    const updateTenantRow = useCallback((id: string, tenant: string) => {
        return updateTenantForMarketplace(id, tenant).then(
            (response) => {
                console.log('success', response);
            },
            (error) => {
                console.log('failure', error);
                setLoading(false);
                setServerError(error);
            }
        );
    }, []);

    if (accountId) {
        return (
            <Stack spacing={2}>
                {serverError ? (
                    <AlertBox
                        severity="error"
                        short
                        title={<FormattedMessage id="common.fail" />}
                    >
                        {serverError}
                    </AlertBox>
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
                        onClick={() => updateTenantRow(accountId, prefix)}
                        sx={{ mt: 2 }}
                    >
                        <span>
                            <FormattedMessage id="cta.continue" />
                        </span>
                    </LoadingButton>
                </Box>
            </Stack>
        );
    } else {
        return <Navigate to={authenticatedRoutes.home.path} replace />;
    }
}

export default MarketplaceVerificationProcessor;
