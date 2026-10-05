import { Box, Link, Paper, Tooltip, Typography, useTheme } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { NavArrowRight } from 'iconoir-react';

import {
    AGENT_SKILLS_URL,
    LINK_COLOR,
    SECONDARY_TEXT_COLOR,
    SHIMMER_STYLES,
    useAgentSkillsStore,
} from 'src/components/AgentSkills/shared';
import { SparkleIcon } from 'src/components/AgentSkills/SparkleIcon';

function TooltipContent({ onClick }: { onClick: () => void }) {
    const theme = useTheme();
    const mode = theme.palette.mode;

    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                width: 320,
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid rgba(15,23,42,0.06)',
                boxShadow:
                    '0 1px 2px rgba(15,23,42,0.04), 0 14px 36px -8px rgba(15,23,42,0.22), 0 24px 56px -12px rgba(46,100,235,0.20)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    height: 3,
                    ...SHIMMER_STYLES(mode),
                }}
            />
            <Box sx={{ p: '14px 16px' }}>
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                    }}
                >
                    Meet Estuary Agent Skills
                </Typography>
                <Typography
                    sx={{
                        fontSize: 12.5,
                        lineHeight: 1.4,
                        color: SECONDARY_TEXT_COLOR[mode],
                        mb: '10px',
                    }}
                >
                    Give any AI agent the skills to build connectors, debug
                    pipelines, and check stats on Estuary, from wherever you
                    work.
                </Typography>
                <Box
                    component="span"
                    sx={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: LINK_COLOR,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                    }}
                >
                    Read the docs
                    <NavArrowRight width={16} height={16} />
                </Box>
            </Box>
        </Paper>
    );
}

export function Pill() {
    const postHog = usePostHog();
    const toastDismissed = useAgentSkillsStore((s) => s.toastDismissed);

    if (!toastDismissed) {
        return null;
    }

    return (
        <Tooltip
            title={
                <TooltipContent
                    onClick={() => {
                        postHog.capture('AgentSkills:Click', {
                            source: 'popover',
                        });
                        window.open(
                            AGENT_SKILLS_URL,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }}
                />
            }
            placement="bottom-start"
            enterDelay={200}
            leaveDelay={100}
            slotProps={{
                tooltip: {
                    sx: {
                        bgcolor: 'transparent',
                        p: 0,
                        maxWidth: 'none',
                    },
                },
            }}
        >
            <Link
                href={AGENT_SKILLS_URL}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                onClick={() =>
                    postHog.capture('AgentSkills:Click', {
                        source: 'pill',
                    })
                }
                sx={{
                    'display': 'flex',
                    'width': '100%',
                    'alignItems': 'center',
                    'justifyContent': 'flex-start',
                    'gap': 1,
                    'py': '6px',
                    'px': '10px',
                    'borderRadius': '8px',
                    'color': 'text.primary',
                    'fontSize': 13,
                    'fontWeight': 400,
                    'cursor': 'pointer',
                    'transition':
                        'background 180ms ease, transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                        background:
                            'linear-gradient(135deg, rgba(46,100,235,0.14) 0%, rgba(54,197,176,0.16) 100%)',
                        boxShadow: '0 6px 16px -6px rgba(46,100,235,0.35)',
                    },
                }}
            >
                <SparkleIcon
                    sx={{
                        fontSize: 21,
                        color: 'inherit',
                        flexShrink: 0,
                    }}
                />
                <Typography
                    component="span"
                    sx={{
                        my: 0.5,
                        flex: '1 1 auto',
                        minWidth: 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        color: 'inherit',
                    }}
                >
                    Agent Skills
                </Typography>
            </Link>
        </Tooltip>
    );
}
