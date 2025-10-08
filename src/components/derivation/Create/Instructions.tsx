import type { InstructionsProps } from 'src/components/derivation/Create/types';

import {
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import SingleLineCode from 'src/components/content/SingleLineCode';

function Instructions({ draftId }: InstructionsProps) {
    const intl = useIntl();

    return (
        <Stepper orientation="vertical">
            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.1' })}
                </StepLabel>
                <StepContent>
                    <MessageWithLink messageID="newTransform.steps.1.details" />
                </StepContent>
            </Step>
            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.2' })}
                </StepLabel>
                <StepContent>
                    <Stack spacing={2}>
                        <SingleLineCode
                            value={intl.formatMessage({
                                id: 'newTransform.steps.2.code',
                            })}
                        />

                        <MessageWithLink messageID="newTransform.steps.2.details" />
                    </Stack>
                </StepContent>
            </Step>
            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.3' })}
                </StepLabel>

                <StepContent>
                    <Stack spacing={2}>
                        <SingleLineCode
                            value={intl.formatMessage(
                                {
                                    id: 'newTransform.steps.3.code',
                                },
                                { draftId }
                            )}
                        />

                        <MessageWithLink messageID="newTransform.steps.3.details" />
                    </Stack>
                </StepContent>
            </Step>
            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.4' })}
                </StepLabel>

                <StepContent>
                    <Stack spacing={2}>
                        <SingleLineCode
                            value={intl.formatMessage({
                                id: 'newTransform.steps.4.code',
                            })}
                        />

                        <Typography>
                            {intl.formatMessage(
                                { id: 'newTransform.steps.4.details' },
                                {
                                    emphasis: (
                                        <Typography
                                            component="code"
                                            sx={{
                                                fontFamily: 'Monospace',
                                            }}
                                        >
                                            {intl.formatMessage({
                                                id: 'newTransform.steps.4.details.emphasis',
                                            })}
                                        </Typography>
                                    ),
                                }
                            )}
                        </Typography>
                    </Stack>
                </StepContent>
            </Step>
            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.5' })}
                </StepLabel>

                <StepContent>
                    <Stack spacing={2}>
                        <SingleLineCode
                            value={intl.formatMessage({
                                id: 'newTransform.steps.5.code',
                            })}
                        />

                        <MessageWithLink messageID="newTransform.steps.5.details" />
                    </Stack>
                </StepContent>
            </Step>

            <Step active>
                <StepLabel>
                    {intl.formatMessage({ id: 'newTransform.steps.6' })}
                </StepLabel>

                <StepContent>
                    <Stack spacing={2}>
                        <SingleLineCode
                            value={intl.formatMessage({
                                id: 'newTransform.steps.6.code',
                            })}
                        />

                        <MessageWithLink messageID="newTransform.steps.6.details" />
                    </Stack>
                </StepContent>
            </Step>
        </Stepper>
    );
}

export default Instructions;
