import { Box, Link, Paper, Tooltip, Typography, useTheme } from '@mui/material';

import { NavArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import {
    AGENT_SKILLS_URL,
    LINK_COLOR,
    SECONDARY_TEXT_COLOR,
    SHIMMER_STYLES,
} from 'src/components/AgentSkills/shared';
import { SparkleIcon } from 'src/components/AgentSkills/SparkleIcon';

function TooltipContent() {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const intl = useIntl();

    return (
        <Paper
            elevation={0}
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
                    {intl.formatMessage({
                        id: 'agentSkills.title',
                    })}
                </Typography>
                <Typography
                    sx={{
                        fontSize: 12.5,
                        lineHeight: 1.4,
                        color: SECONDARY_TEXT_COLOR[mode],
                        mb: '10px',
                    }}
                >
                    {intl.formatMessage({
                        id: 'agentSkills.description',
                    })}
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
                    {intl.formatMessage({
                        id: 'agentSkills.cta',
                    })}
                    <NavArrowRight style={{ fontSize: 16 }} />
                </Box>
            </Box>
        </Paper>
    );
}

interface HeaderPillProps {
    isOpen?: boolean;
}

export function HeaderPill({ isOpen = true }: HeaderPillProps) {
    const intl = useIntl();

    return (
        <Tooltip
            title={<TooltipContent />}
            placement={isOpen ? 'bottom-start' : 'right'}
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
                sx={{
                    'display': 'flex',
                    'width': '100%',
                    'alignItems': 'center',
                    'justifyContent': 'flex-start',
                    'gap': 1,
                    'py': '6px',
                    'px': '10px',
                    'borderRadius': '999px',
                    'fontSize': 13,
                    'fontWeight': 600,
                    'cursor': 'pointer',
                    'transition':
                        'background 180ms ease, transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                        background:
                            'linear-gradient(135deg, rgba(46,100,235,0.14) 0%, rgba(54,197,176,0.16) 100%)',
                        boxShadow: '0 6px 16px -6px rgba(46,100,235,0.35)',
                        transform: 'translateY(-1px)',
                    },
                }}
            >
                <SparkleIcon
                    sx={{
                        width: 18,
                        height: 18,
                        color: 'text.primary',
                        flexShrink: 0,
                    }}
                />
                <Typography
                    component="span"
                    sx={{
                        whiteSpace: 'nowrap',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                    }}
                >
                    {intl.formatMessage({ id: 'agentSkills.pill.label' })}
                </Typography>
            </Link>
        </Tooltip>
    );
}
