import type {
    InstructionsProps,
    InstructionStepProps,
} from 'src/components/derivation/Create/types';

import { Stack, Step, Stepper, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import InstructionStep from 'src/components/derivation/Create/InstructionStep';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';

function Instructions({ draftId }: InstructionsProps) {
    const intl = useIntl();

    const steps: InstructionStepProps[] = [
        {
            labelKey: 'newTransform.steps.1',
            labelValues: {
                emphasis: (
                    <TechnicalEmphasis intlKey="newTransform.steps.1.emphasis" />
                ),
            },
            contentSections: ['linked'],
        },
        {
            labelKey: 'newTransform.steps.2',
            contentSections: ['code', 'linked'],
        },
        {
            labelKey: 'newTransform.steps.3',
            contentSections: ['code', 'linked'],
            codeValues: { draftId },
        },
        {
            labelKey: 'newTransform.steps.4',
            contentSections: ['code', 'details'],
        },
        {
            labelKey: 'newTransform.steps.5',
            contentSections: ['details', 'linked'],
            detailsValues: {
                emphasis: (
                    <TechnicalEmphasis
                        enableBackground
                        intlKey="newTransform.steps.5.details.emphasis"
                    />
                ),
            },
        },
        {
            labelKey: 'newTransform.steps.6',
            contentSections: ['code', 'details'],
        },
        {
            labelKey: 'newTransform.steps.7',
            contentSections: ['code', 'details'],
        },
    ];

    return (
        <Stack spacing={2}>
            <Typography>
                {intl.formatMessage({
                    id: 'newTransform.steps.message',
                })}
            </Typography>

            <Stepper
                orientation="vertical"
                component="ol"
                sx={{
                    pl: 0,
                    [`& >li`]: {
                        listStyleType: 'none',
                    },
                }}
            >
                {steps.map((step, index) => (
                    <Step
                        active
                        key={`derivation_create_instructions_${index}`}
                        component="li"
                    >
                        <InstructionStep {...step} />
                    </Step>
                ))}
            </Stepper>
        </Stack>
    );
}

export default Instructions;
