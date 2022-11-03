import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    Collapse,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { submitDirective } from 'api/directives';
import AlertBox from 'components/shared/AlertBox';
import { PREFIX_NAME_PATTERN } from 'components/tables/Details/StatusIndicatorAndLabel';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { jobStatusPoller } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { DirectiveStates, jobStatusQuery } from './shared';

const submit_onboard = async (requestedTenant: string, directive: any) => {
    return submitDirective('betaOnboard', directive, requestedTenant);
};

interface Props {
    directive: any;
    status: DirectiveStates;
}

const BetaOnboard = ({ directive, status }: Props) => {
    console.log('Guard:Form:BetaOnBoard', { directive, status });

    const intl = useIntl();
    const navigate = useNavigate();

    const exchangedTokenAlready = status === DirectiveStates.IN_PROGRESS;

    const [requestedTenant, setRequestedTenant] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [nameMissing, setNameMissing] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const [showExample, setShowExample] = useState(false);
    const toggleExample = () => {
        setShowExample(!showExample);
    };

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);

            if (nameMissing) setNameMissing(!hasLength(updatedValue));
        },
        submit: async (event: any) => {
            event.preventDefault();

            if (!hasLength(requestedTenant)) {
                setNameMissing(true);
                setServerError(null);
            } else {
                setServerError(null);
                setNameMissing(false);
                setSaving(true);

                const clickToAcceptResponse = await submit_onboard(
                    requestedTenant,
                    exchangedTokenAlready ? directive : null
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
                        setSaving(false);
                        setServerError(payload.job_status.error);
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
                    alignItems: 'left',
                }}
            >
                <Typography variant="h5" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage id="tenant.heading" />
                </Typography>

                {nameMissing ? (
                    <AlertBox
                        short
                        severity="error"
                        title={<FormattedMessage id="error.title" />}
                    >
                        <FormattedMessage id="tenant.errorMessage.empty" />
                    </AlertBox>
                ) : null}

                {serverError ? (
                    <AlertBox
                        severity="error"
                        short
                        title={<FormattedMessage id="common.fail" />}
                    >
                        {serverError}
                    </AlertBox>
                ) : null}

                <Typography>
                    <FormattedMessage id="tenant.message.1" />
                </Typography>

                <Typography>
                    <FormattedMessage id="tenant.message.2" />
                </Typography>

                <Box>
                    <Button
                        variant="text"
                        onClick={toggleExample}
                        endIcon={
                            <ExpandMoreIcon
                                sx={{
                                    transform: `rotate(${
                                        showExample ? '180' : '0'
                                    }deg)`,
                                    transition: (theme) =>
                                        `${theme.transitions.duration.shortest}ms`,
                                }}
                            />
                        }
                    >
                        <FormattedMessage id="tenant.help.title" />
                    </Button>
                    <Collapse in={showExample} unmountOnExit>
                        <Box sx={{ p: 2, pt: 0 }}>
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
                        </Box>
                    </Collapse>
                </Box>
            </Stack>

            <form noValidate onSubmit={handlers.submit}>
                <Stack
                    spacing={2}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder={intl.formatMessage({
                            id: 'tenant.input.placeholder',
                        })}
                        helperText={intl.formatMessage({
                            id: nameMissing
                                ? 'tenant.expectations.error'
                                : 'tenant.expectations',
                        })}
                        error={nameMissing}
                        id="requestedTenant"
                        label={<FormattedMessage id="common.tenant" />}
                        value={requestedTenant}
                        onChange={(event) =>
                            handlers.update(event.target.value)
                        }
                        required
                        inputProps={{
                            pattern: PREFIX_NAME_PATTERN,
                        }}
                    />

                    <Toolbar>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={saving}
                            disabled={saving}
                        >
                            <FormattedMessage id="cta.continue" />
                        </LoadingButton>
                    </Toolbar>
                </Stack>
            </form>
        </>
    );
};

export default BetaOnboard;
