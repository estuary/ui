import { Box, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import {
    useOnboardingStore_nameInvalid,
    useOnboardingStore_nameMissing,
    useOnboardingStore_nameProblematic,
    useOnboardingStore_serverError,
    useOnboardingStore_surveyMissing,
} from 'src/directives/Onboard/Store/hooks';

const BetaWarningAndError = () => {
    const intl = useIntl();

    // Onboarding Store
    const nameInvalid = useOnboardingStore_nameInvalid();
    const nameMissing = useOnboardingStore_nameMissing();
    const nameProblematic = useOnboardingStore_nameProblematic();
    const surveyMissing = useOnboardingStore_surveyMissing();
    const serverError = useOnboardingStore_serverError();

    return (
        <>
            {nameProblematic ? (
                <Box>
                    <AlertBox
                        severity="warning"
                        short
                        title={intl.formatMessage({ id: 'confirm.title' })}
                    >
                        {intl.formatMessage({
                            id: 'tenant.warningMessage.problematic',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            {serverError ? (
                <Box>
                    <AlertBox
                        severity="error"
                        short
                        title={intl.formatMessage({
                            id: 'common.fail',
                        })}
                    >
                        {serverError}
                    </AlertBox>
                </Box>
            ) : null}

            {nameMissing || surveyMissing || nameInvalid ? (
                <Box>
                    <AlertBox
                        short
                        severity="error"
                        title={intl.formatMessage({ id: 'error.title' })}
                    >
                        {nameMissing ? (
                            <Typography>
                                {intl.formatMessage({
                                    id: 'tenant.errorMessage.empty',
                                })}
                            </Typography>
                        ) : null}

                        {nameInvalid ? (
                            <Typography>
                                {intl.formatMessage({
                                    id: 'tenant.errorMessage.invalid',
                                })}
                            </Typography>
                        ) : null}

                        {surveyMissing ? (
                            <Typography>
                                {intl.formatMessage({
                                    id: 'tenant.origin.errorMessage.empty',
                                })}
                            </Typography>
                        ) : null}
                    </AlertBox>
                </Box>
            ) : null}
        </>
    );
};

export default BetaWarningAndError;
