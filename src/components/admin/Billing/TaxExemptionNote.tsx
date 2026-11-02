import { useState } from 'react';

import { Box, Link, Popover, Stack, Typography } from '@mui/material';

const SUPPORT_EMAIL = 'support@estuary.dev';

const examples = [
    'You are a nonprofit, charitable, religious, or educational organization, or a government agency',
    'You purchase the service to resell it, or incorporate it into a product or service you sell to your own customers',
    'The software is used for research and development, manufacturing or production, or by certain qualifying industries',
    'The software is purchased for business use in states that exempt or do not tax business purchases of SaaS',
];

const supportLink = (
    <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>
);

export function TaxExemptionNote() {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    return (
        <>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Exempt from sales tax? Email {supportLink} with your exemption
                certificate.{' '}
                <Link
                    component="button"
                    aria-haspopup="dialog"
                    onClick={(event) => setAnchor(event.currentTarget)}
                    sx={{ font: 'inherit', verticalAlign: 'baseline' }}
                >
                    Who is exempt?
                </Link>
            </Typography>

            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        'role': 'dialog',
                        'aria-label': 'Who is exempt from sales tax?',
                        'sx': { p: 2, maxWidth: 480 },
                    },
                }}
            >
                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="body2">
                            Depending on your state and tax status, you may
                            qualify for a sales tax exemption, for example if:
                        </Typography>
                        <Box component="ul" sx={{ my: 1, pl: 2.5 }}>
                            {examples.map((example) => (
                                <Typography
                                    key={example}
                                    component="li"
                                    variant="body2"
                                >
                                    {example}
                                </Typography>
                            ))}
                        </Box>
                        <Typography variant="body2">
                            To request an exemption, email {supportLink} with
                            your company name, billing state, and a completed
                            exemption or resale certificate.
                        </Typography>
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                    >
                        This information is provided for general informational
                        purposes only and does not constitute tax or legal
                        advice. Sales tax rules and exemption eligibility vary
                        by state and by the nature of the purchase. Please
                        consult your tax advisor to determine whether your
                        organization qualifies for an exemption.
                    </Typography>
                </Stack>
            </Popover>
        </>
    );
}
