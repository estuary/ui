import type { IconButtonProps, SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';

import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { Star, StarSolid, Xmark } from 'iconoir-react';
import { Flipped, Flipper } from 'react-flip-toolkit';

const StyledFlipper = styled(Flipper)({});

interface PrimaryListProps<T> {
    items: T[];
    onChange: (items: T[]) => void;
    disabled?: boolean;
    sx?: SxProps<Theme>;
    renderLabel: (item: T) => string;
    // Keys must be unique and stable across reordering. Defaults to renderLabel.
    getKey?: (item: T) => string;
    renderBody?: (item: T, isPrimary: boolean) => ReactNode;
}

// The first item is primary. Selecting a star moves that item to the front;
// other items retain their relative order. Removal is committed after the exit animation.
export function PrimaryList<T>({
    items,
    onChange,
    disabled = false,
    renderLabel,
    getKey = renderLabel,
    renderBody,
    sx,
}: PrimaryListProps<T>) {
    const [previous, setPrevious] = useState(items);
    const [incoming, setIncoming] = useState<Set<string>>(new Set());
    const [removing, setRemoving] = useState<string | null>(null);

    if (previous !== items) {
        setPrevious(items);
        const previousKeys = new Set(previous.map(getKey));
        const nextKeys = new Set(items.map(getKey));
        if (removing !== null && !nextKeys.has(removing)) setRemoving(null);
        const added = items.filter((item) => !previousKeys.has(getKey(item)));
        if (added.length > 0) setIncoming(new Set(added.map(getKey)));
    }

    useEffect(() => {
        if (incoming.size === 0) return;
        const frame = requestAnimationFrame(() => setIncoming(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [incoming]);

    const actionsDisabled = disabled || removing !== null;

    const finishRemoval = () => {
        if (removing === null) return;
        onChange(items.filter((item) => getKey(item) !== removing));
        setRemoving(null);
    };

    return (
        <StyledFlipper flipKey={JSON.stringify(items.map(getKey))} sx={sx}>
            {items.map((item, index) => {
                const key = getKey(item);
                const label = renderLabel(item);
                const exiting = removing === key;
                const isPrimary = index === 0;
                const visible = !exiting && !incoming.has(key);
                return (
                    <Flipped key={key} flipId={key}>
                        <Collapse
                            in={visible}
                            sx={{ mb: 0.5 }}
                            onExited={() => {
                                if (removing === key) finishRemoval();
                            }}
                            unmountOnExit
                        >
                            <Stack
                                direction="row"
                                spacing={0.25}
                                alignItems="center"
                            >
                                <Row
                                    label={label}
                                    body={renderBody?.(item, isPrimary)}
                                    primary={isPrimary}
                                    disabled={actionsDisabled}
                                    onSelectPrimary={() => {
                                        onChange([
                                            items[index],
                                            ...items.filter(
                                                (_, i) => i !== index
                                            ),
                                        ]);
                                    }}
                                />
                                <RemoveButton
                                    aria-label={`Remove ${label}`}
                                    disabled={actionsDisabled}
                                    onClick={() => setRemoving(key)}
                                />
                            </Stack>
                        </Collapse>
                    </Flipped>
                );
            })}
        </StyledFlipper>
    );
}

function RemoveButton(
    props: Pick<IconButtonProps, 'aria-label' | 'disabled' | 'onClick'>
) {
    return (
        <IconButton
            {...props}
            size="small"
            sx={{
                'bgcolor': 'background.default',
                'borderRadius': 3,
                'borderTopLeftRadius': 0,
                'borderBottomLeftRadius': 0,
                'alignSelf': 'stretch',
                'flexShrink': 0,
                'width': (theme) => theme.spacing(5),
                '&.Mui-disabled': {
                    bgcolor: 'background.default',
                    color: 'action.active',
                },
            }}
        >
            <Xmark width={16} height={16} />
        </IconButton>
    );
}

function starColor(alpha: number) {
    return `rgba(245, 197, 24, ${alpha})`;
}
interface RowProps {
    label: string;
    body?: ReactNode;
    primary: boolean;
    onSelectPrimary?: () => void;
    disabled?: boolean;
}

function Row({ label, body, primary, onSelectPrimary, disabled }: RowProps) {
    return (
        <Box
            sx={{
                'display': 'flex',
                'justifyContent': 'space-between',
                'alignItems': 'center',
                'flex': 1,
                'minWidth': 0,
                'px': 1.5,
                'py': 0.75,
                'borderRadius': 3,
                'borderTopRightRadius': 0,
                'borderBottomRightRadius': 0,
                'bgcolor': 'background.default',
                '&:hover .star-outline, &:focus-within .star-outline': {
                    opacity: 1,
                },
            }}
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: 0 }}
            >
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {label}
                </Typography>
                {primary ? (
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            color: starColor(1),
                            // Match the small IconButton's padding on other rows.
                            p: '5px',
                            flexShrink: 0,
                        }}
                    >
                        <StarSolid width={16} height={16} />
                    </Box>
                ) : (
                    <IconButton
                        size="small"
                        aria-label="select as default"
                        onClick={onSelectPrimary}
                        disabled={disabled}
                        className="star-outline"
                        sx={{
                            'opacity': 0,
                            'transition': 'opacity 0.15s',
                            'color': '#9e9e9e',
                            'flexShrink': 0,
                            '& svg': {
                                transition: 'fill 0.15s',
                            },
                            '&:hover': {
                                bgcolor: 'transparent',
                            },
                            '&:hover svg': {
                                fill: starColor(0.2),
                            },
                        }}
                    >
                        <Star width={16} height={16} />
                    </IconButton>
                )}
            </Stack>
            {body}
        </Box>
    );
}
