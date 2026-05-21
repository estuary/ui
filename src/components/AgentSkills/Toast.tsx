import type { MouseEvent } from 'react';

import {
    Box,
    IconButton,
    keyframes,
    Link,
    Typography,
    useTheme,
} from '@mui/material';

import { NavArrowRight, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';

import {
    AGENT_SKILLS_URL,
    GRADIENT,
    LINK_COLOR,
    SECONDARY_TEXT_COLOR,
    SHIMMER_STYLES,
} from 'src/components/AgentSkills/shared';
import { SparkleIcon } from 'src/components/AgentSkills/SparkleIcon';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

const toastIn = keyframes`
    0%   { opacity: 0; transform: translateY(16px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0)    scale(1);    }
`;

export function AgentSkillsToast() {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const intl = useIntl();
    const [dismissed, setDismissed] = useLocalStorage(
        LocalStorageKeys.AGENT_SKILLS_TOAST_DISMISSED,
        false
    );

    if (dismissed) {
        return null;
    }

    const handleClick = () => {
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
                'zIndex': 1200,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow:
                        '0 1px 2px rgba(15, 23, 42, 0.04), 0 18px 40px -8px rgba(15, 23, 42, 0.22), 0 36px 80px -12px rgba(46, 100, 235, 0.28)',
                },
                '&:hover .est-toast-cta-arrow': {
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
                        sx={{ width: 26, height: 26, color: '#fff' }}
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
                            {intl.formatMessage({ id: 'agentSkills.badge' })}
                        </Box>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: 11,
                                color: '#64748b',
                                fontWeight: 500,
                            }}
                        >
                            {intl.formatMessage({
                                id: 'agentSkills.eyebrow',
                            })}
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
                        {intl.formatMessage({ id: 'agentSkills.title' })}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 13,
                            color: SECONDARY_TEXT_COLOR[mode],
                            lineHeight: 1.4,
                            mb: '10px',
                        }}
                    >
                        {intl.formatMessage({ id: 'agentSkills.description' })}
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
                        {intl.formatMessage({ id: 'agentSkills.cta' })}
                        <NavArrowRight
                            className="est-toast-cta-arrow"
                            width={17}
                            height={17}
                            strokeWidth={1.8}
                            style={{ transition: 'transform 200ms ease' }}
                        />
                    </Link>
                </Box>

                {/* Close button */}
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDismissed(true);
                    }}
                    aria-label={intl.formatMessage({
                        id: 'agentSkills.dismiss',
                    })}
                    sx={{
                        'width': 20,
                        'height': 20,
                        'p': 0,
                        'color': '#94a3b8',
                        '&:hover': { color: '#475569', background: 'none' },
                    }}
                >
                    <Xmark width={20} height={20} />
                </IconButton>
            </Box>
        </Box>
    );
}
