import type { InstructionStepProps } from 'src/components/derivation/Create/types';

import { Stack, StepContent, StepLabel, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import SingleLineCode from 'src/components/content/SingleLineCode';

function InstructionStep({
    codeValues,
    contentSections,
    detailsHaveLink = false,
    detailsValues,
    labelKey,
    labelValues,
}: InstructionStepProps) {
    const intl = useIntl();

    return (
        <>
            <StepLabel>
                {intl.formatMessage({ id: labelKey }, labelValues)}
            </StepLabel>
            <StepContent>
                <Stack spacing={2}>
                    {contentSections.map((section) => {
                        const sectionKey = `${labelKey}.${section}`;

                        if (section === 'code') {
                            return (
                                <SingleLineCode
                                    key={section}
                                    value={intl.formatMessage(
                                        { id: sectionKey },
                                        codeValues
                                    )}
                                />
                            );
                        }

                        if (section === 'details' || section === 'learnMore') {
                            return detailsHaveLink ? (
                                <MessageWithLink
                                    key={section}
                                    messageID={sectionKey}
                                    intlValues={detailsValues}
                                />
                            ) : (
                                <Typography key={section}>
                                    {intl.formatMessage(
                                        { id: sectionKey },
                                        detailsValues
                                    )}
                                </Typography>
                            );
                        }

                        return null;
                    })}
                </Stack>
            </StepContent>
        </>
    );
}

export default InstructionStep;
