import { LoadingButton } from '@mui/lab';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { submitDirective } from 'api/directives';
import AlertBox from 'components/shared/AlertBox';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { jobStatusPoller } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { jobStatusQuery } from './shared';

const submit_onboard = async (requestedTenant: string) => {
    return submitDirective('betaOnboard', requestedTenant);
};

const BetaOnboard = () => {
    console.log('Guard:Form:BetaOnboard');

    const navigate = useNavigate();

    const [requestedTenant, setRequestedTenant] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);

            if (showErrors) setShowErrors(!hasLength(updatedValue));
        },
        submit: async (event: any) => {
            event.preventDefault();

            if (!hasLength(requestedTenant)) {
                setShowErrors(true);
            } else {
                setShowErrors(false);
                setSaving(true);

                const clickToAcceptResponse = await submit_onboard(
                    requestedTenant
                );

                if (clickToAcceptResponse.error) {
                    return console.log(clickToAcceptResponse.error);
                }

                const data = clickToAcceptResponse.data[0];
                jobStatusPoller(
                    jobStatusQuery(data),
                    async () => {
                        navigate(0);
                    },
                    async (payload: any) => {
                        console.log('failed', payload);
                        setSaving(false);
                    }
                );
            }
        },
    };

    return (
        <>
            <Stack
                spacing={2}
                sx={{
                    mt: 1,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                }}
            >
                <Typography variant="h5" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage id="tenant.heading" />
                </Typography>

                <Typography>
                    <FormattedMessage id="tenant.message.1" />
                </Typography>
                <Typography>
                    <FormattedMessage id="tenant.message.2" />
                </Typography>

                <Paper>
                    <Accordion>
                        <AccordionSummary>
                            <Button variant="text">
                                <FormattedMessage id="tenant.help.title" />
                            </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Typography>
                                    <FormattedMessage
                                        id="tenant.help.example.title"
                                        values={{
                                            name: (
                                                <Typography
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    <FormattedMessage id="tenant.help.example.name" />
                                                </Typography>
                                            ),
                                        }}
                                    />
                                </Typography>

                                <Typography>
                                    <FormattedMessage id="tenant.help.example.details" />
                                </Typography>

                                <Typography>
                                    <FormattedMessage
                                        id="tenant.help.example.breakdown"
                                        values={{
                                            template: (
                                                <Typography
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    <FormattedMessage id="tenant.help.example.template" />
                                                </Typography>
                                            ),
                                        }}
                                    />
                                </Typography>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </Paper>
                <Paper>
                    <Accordion defaultExpanded>
                        <AccordionSummary>
                            <Button variant="text">
                                <FormattedMessage id="tenant.expectations" />
                            </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Typography>
                                    <FormattedMessage id="tenant.expectations.1" />
                                </Typography>
                                <Typography>
                                    <FormattedMessage id="tenant.expectations.2" />
                                </Typography>
                                <Typography>
                                    <FormattedMessage id="tenant.expectations.3" />
                                </Typography>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </Paper>

                {showErrors ? (
                    <AlertBox
                        short
                        severity="error"
                        title={<FormattedMessage id="error.title" />}
                    >
                        <FormattedMessage id="tenant.errorMessage.empty" />
                    </AlertBox>
                ) : null}
            </Stack>

            <form
                noValidate
                onSubmit={handlers.submit}
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <TextField
                    error={showErrors}
                    id="requestedTenant"
                    label={<FormattedMessage id="common.tenant" />}
                    value={requestedTenant}
                    onChange={(event) => handlers.update(event.target.value)}
                    required
                />

                <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={saving}
                    disabled={saving}
                >
                    <FormattedMessage id="cta.continue" />
                </LoadingButton>
            </form>
        </>
    );
};

export default BetaOnboard;
