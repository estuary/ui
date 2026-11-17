import type {
    InstructionsProps,
    InstructionStepProps,
} from 'src/components/derivation/Create/types';

import { Stack, Step, Stepper, Typography } from '@mui/material';

import InstructionStep from 'src/components/derivation/Create/InstructionStep';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';

function Instructions({ draftId }: InstructionsProps) {
    const steps: InstructionStepProps[] = [
        {
            labelKey: 'newTransform.steps.1',
            labelValues: {
                emphasis: <TechnicalEmphasis>flowctl</TechnicalEmphasis>,
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
                    <TechnicalEmphasis enableBackground>
                        flow.yaml
                    </TechnicalEmphasis>
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
                {
                    "Now that you've created a derivation draft, you will need to continue development locally or in a cloud environment. Follow these steps to edit and publish your derivation using the command line."
                }
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
