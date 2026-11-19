import type { ReactNode } from 'react';
import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';

import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';

import { EvPlugCharging, NavArrowDown, Plus } from 'iconoir-react';

import { EmptyState } from 'src/components/admin/Settings/PrivateLinks/EmptyState';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { getRegionDisplayName } from 'src/utils/cloudRegions';

interface PrivateDataPlaneProps {
    plane: PrivateLinkDataPlane;
    open: boolean;
    compact: boolean;
    // Omit for a plane that cannot be collapsed.
    onToggle?: () => void;
    onDetails: () => void;
    // Omit when the user cannot add a link to this plane.
    onAdd?: () => void;
    children: ReactNode;
}

export function PrivateDataPlane({
    plane,
    open,
    compact,
    onToggle,
    onDetails,
    onAdd,
    children,
}: PrivateDataPlaneProps) {
    const bodyId = `private-links-${encodeURIComponent(plane.name)}`;
    const empty = plane.privateLinks.length === 0;
    const identity = <PlaneIdentity plane={plane} compact={compact} />;
    const add = (size: 'small' | 'medium') =>
        onAdd ? (
            <Button
                size={size}
                startIcon={<Plus width={15} height={15} aria-hidden />}
                onClick={onAdd}
            >
                Add private link
            </Button>
        ) : null;

    return (
        <Box
            sx={{
                'borderBottom': 1,
                'borderColor': 'divider',
                '&:last-child': { borderBottom: 0 },
            }}
        >
            <Stack
                direction="row"
                useFlexGap
                spacing={1}
                sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    px: 1.5,
                    py: 1,
                    bgcolor: open ? 'action.hover' : undefined,
                }}
            >
                {onToggle ? (
                    <ButtonBase
                        aria-expanded={open}
                        aria-controls={bodyId}
                        onClick={onToggle}
                        sx={{
                            'flex': '1 1 225px',
                            'minWidth': 0,
                            'gap': 1,
                            'py': 0.5,
                            'textAlign': 'left',
                            'justifyContent': 'flex-start',
                            '&.Mui-focusVisible': {
                                outline: '2px solid',
                                outlineColor: 'primary.main',
                                outlineOffset: 2,
                            },
                        }}
                    >
                        <NavArrowDown
                            width={16}
                            height={16}
                            aria-hidden
                            style={{
                                flexShrink: 0,
                                transform: open ? undefined : 'rotate(-90deg)',
                            }}
                        />
                        {identity}
                    </ButtonBase>
                ) : (
                    identity
                )}
                {open ? (
                    <Stack
                        direction="row"
                        useFlexGap
                        spacing={0.5}
                        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                        <Button
                            variant="text"
                            size="small"
                            onClick={onDetails}
                            aria-label={`Details for ${plane.displayName}`}
                        >
                            Details
                        </Button>
                        {empty ? null : add('small')}
                    </Stack>
                ) : null}
            </Stack>
            <Box id={bodyId} hidden={!open}>
                {!open ? null : empty ? (
                    <Box
                        sx={{
                            m: 1.5,
                            border: 1,
                            borderStyle: 'dashed',
                            borderColor: 'divider',
                            borderRadius: 1,
                        }}
                    >
                        <EmptyState
                            icon={<EvPlugCharging aria-hidden />}
                            title="No private links yet"
                            actions={add('medium')}
                        >
                            Connect a cloud endpoint service to this data plane
                            to move data over a private link, without traversing
                            the public internet.
                        </EmptyState>
                    </Box>
                ) : (
                    children
                )}
            </Box>
        </Box>
    );
}

function PlaneIdentity({
    plane,
    compact,
}: Pick<PrivateDataPlaneProps, 'plane' | 'compact'>) {
    const failed = plane.privateLinks.filter(
        ({ status }) => status === 'FAILED'
    ).length;
    const pending = plane.privateLinks.filter(
        ({ status }) => status === 'PENDING'
    ).length;

    return (
        <Stack
            component="span"
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}
        >
            <DataPlaneIcon
                hideScopeIcon
                provider={plane.cloudProvider}
                scope="private"
            />
            <Stack
                component="span"
                direction={compact ? 'row' : 'column'}
                useFlexGap
                spacing={compact ? 1 : 0.25}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    flexWrap: compact ? 'wrap' : 'nowrap',
                    alignItems: compact ? 'baseline' : 'stretch',
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    component="span"
                    direction="row"
                    useFlexGap
                    spacing={0.75}
                    sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
                >
                    <Typography
                        component="span"
                        variant="body2"
                        fontWeight={600}
                        sx={{ overflowWrap: 'anywhere' }}
                    >
                        {plane.displayName}
                    </Typography>
                    {plane.region ? (
                        <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                        >
                            {getRegionDisplayName(
                                plane.cloudProvider,
                                plane.region
                            )}
                        </Typography>
                    ) : null}
                </Stack>
                <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                >
                    {plane.privateLinks.length} private{' '}
                    {plane.privateLinks.length === 1 ? 'link' : 'links'}
                    {failed > 0 ? (
                        <Box component="span" sx={{ color: 'error.main' }}>
                            {' '}
                            · {failed} failed
                        </Box>
                    ) : null}
                    {pending > 0 ? (
                        <Box component="span" sx={{ color: 'warning.main' }}>
                            {' '}
                            · {pending} setting up
                        </Box>
                    ) : null}
                </Typography>
            </Stack>
        </Stack>
    );
}
