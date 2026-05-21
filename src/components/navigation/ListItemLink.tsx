import type { ReactNode } from 'react';

import { Badge, Box, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import RouterLink from 'src/components/navigation/RouterLink';

interface Props {
    icon: ReactNode;
    title: string;
    link: string | any;
    isOpen?: boolean;
    badgeContent?: number;
    tooltipDelay?: number;
}

const ListItemLink = ({
    icon,
    title,
    link,
    isOpen,
    badgeContent,
    tooltipDelay,
}: Props) => {
    const intl = useIntl();

    const translatedTitle = intl.formatMessage({
        id: title,
    });

    const linkProps =
        typeof link === 'string'
            ? { component: RouterLink, to: link }
            : { component: 'a' as const, onClick: link };

    return (
        <li>
            <Tooltip
                title={!isOpen ? translatedTitle : ''}
                placement="right-end"
                enterDelay={tooltipDelay ? tooltipDelay : undefined}
            >
                <Box
                    {...linkProps}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        whiteSpace: 'nowrap',
                        px: 1.25,
                        py: 1,
                        mx: 1,
                        my: 0.25,
                        borderRadius: 4,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        '&.Mui-selected': {
                            backgroundColor: 'action.selected',
                        },
                    }}
                >
                    {icon ? (
                        <Badge badgeContent={badgeContent}>
                            <Box sx={{ display: 'flex', flexShrink: 0 }}>
                                {icon}
                            </Box>
                        </Badge>
                    ) : null}

                    <Typography
                        sx={{
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {translatedTitle}
                    </Typography>
                </Box>
            </Tooltip>
        </li>
    );
};

export default ListItemLink;
