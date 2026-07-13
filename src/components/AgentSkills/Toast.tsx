import type { MouseEvent } from 'react';

import {
    Box,
    IconButton,
    keyframes,
    Link,
    Typography,
    useTheme,
} from '@mui/material';

import { usePostHog } from '@posthog/react';
import { NavArrowRight, Xmark } from 'iconoir-react';

import {
    AGENT_SKILLS_URL,
    GRADIENT,
    LINK_COLOR,
    SECONDARY_TEXT_COLOR,
    SHIMMER_STYLES,
    useAgentSkillsStore,
} from 'src/components/AgentSkills/shared';
import { SparkleIcon } from 'src/components/AgentSkills/SparkleIcon';

const toastIn = keyframes`
    0%   { opacity: 0; transform: translateY(16px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0)    scale(1);    }
`;

export function Toast() {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const postHog = usePostHog();
    const toastDismissed = useAgentSkillsStore((s) => s.toastDismissed);
    const dismissToast = useAgentSkillsStore((s) => s.dismissToast);

    if (toastDismissed) {
        return null;
    }

    const handleClick = () => {
        postHog.capture('AgentSkills:Click', { source: 'toast' });
        window.open(AGENT_SKILLS_URL, '_blank', 'noopener,noreferrer');
    };

    return (
        <Box
            onClick={handleClick}
            sx={{
                'position': 'fixed',
                'right': 24,
                'bottom': 24,
                'width': 380,
                'background': theme.palette.background.paper,
                'borderRadius': '16px',
                'boxShadow':
                    '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -8px rgba(15, 23, 42, 0.18), 0 28px 64px -12px rgba(46, 100, 235, 0.22)',
                'cursor': 'pointer',
                'overflow': 'hidden',
                'color': 'inherit',
                'display': 'block',
                'animation': `${toastIn} 750ms cubic-bezier(.2,.9,.25,1) 1s both`,
                'transition': 'transform 200ms ease, box-shadow 200ms ease',
                'zIndex': theme.zIndex.drawer,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow:
                        '0 1px 2px rgba(15, 23, 42, 0.04), 0 18px 40px -8px rgba(15, 23, 42, 0.22), 0 36px 80px -12px rgba(46, 100, 235, 0.28)',
                },
                '&:hover .cta-arrow': {
                    transform: 'translateX(3px)',
                },
            }}
        >
            <Box
                sx={{
                    height: 3,
                    ...SHIMMER_STYLES(mode),
                }}
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 20px',
                    gap: '14px',
                    p: '16px 18px 16px 16px',
                    alignItems: 'start',
                }}
            >
                {/* Sparkle icon badge */}
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: GRADIENT[mode],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                            'inset 0 0 0 1px rgba(255,255,255,0.18), 0 6px 16px -6px rgba(46, 100, 235, 0.55)',
                    }}
                >
                    <SparkleIcon
                        sx={{ width: 26, height: 26, color: 'common.white' }}
                    />
                </Box>

                {/* Content */}
                <Box sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.5,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: LINK_COLOR,
                                background: '#eaf0ff',
                                px: '7px',
                                py: '2px',
                                borderRadius: '999px',
                                lineHeight: 1.4,
                            }}
                        >
                            New
                        </Box>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: 11,
                                color: '#64748b',
                                fontWeight: 500,
                            }}
                        >
                            For Claude, Cursor, Codex and more
                        </Typography>
                    </Box>

                    <Typography
                        component="h3"
                        sx={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.3,
                            mb: 0.5,
                        }}
                    >
                        Meet Estuary Agent Skills
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 13,
                            color: SECONDARY_TEXT_COLOR[mode],
                            lineHeight: 1.4,
                            mb: '10px',
                        }}
                    >
                        Give any AI agent the skills to build connectors, debug
                        pipelines, and check stats on Estuary, from wherever you
                        work.
                    </Typography>

                    <Link
                        href={AGENT_SKILLS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: LINK_COLOR,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.25,
                        }}
                    >
                        Read the docs
                        <NavArrowRight
                            className="cta-arrow"
                            style={{
                                fontSize: 14,
                                transition: 'transform 200ms ease',
                            }}
                        />
                    </Link>
                </Box>

                {/* Close button */}
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        postHog.capture('AgentSkills:Click', {
                            source: 'dismiss',
                        });
                        dismissToast();
                    }}
                    aria-label="Dismiss"
                    sx={{
                        'width': 20,
                        'height': 20,
                        'p': 0,
                        'color': '#94a3b8',
                        '&:hover': { color: '#475569', background: 'none' },
                    }}
                >
                    <Xmark style={{ fontSize: 20 }} />
                </IconButton>
            </Box>
        </Box>
    );
}
