import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type {
    FormDataPlane,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    Box,
    Checkbox,
    Collapse,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';

import { Star, StarSolid, Xmark } from 'iconoir-react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { useFormContext } from 'react-hook-form';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';
import { toPresentableName } from 'src/utils/dataPlane-utils';

function DataPlaneRow({
    dataPlane,
    isDefault,
    handleSetDefault,
}: {
    dataPlane: DataPlaneNode;
    isDefault?: boolean;
    handleSetDefault?: () => void;
    index?: number;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: 'background.default',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">
                    {toPresentableName(dataPlane)}
                </Typography>
                {isDefault ? (
                    <>
                        <StarSolid width={16} height={16} color="#f5c518" />{' '}
                        <Typography variant="caption" color="text.secondary">
                            Default
                        </Typography>
                    </>
                ) : (
                    <Tooltip title="Set as default" enterDelay={250}>
                        <Box
                            component="span"
                            className="star-outline"
                            onClick={handleSetDefault}
                            sx={{
                                'opacity': 0,
                                'transition': 'opacity 0.15s',
                                'cursor': 'pointer',
                                'display': 'inline-flex',
                                'alignItems': 'center',
                                '& svg': {
                                    transition: 'fill 0.15s',
                                },
                                '&:hover svg': {
                                    fill: 'rgba(245, 197, 24, 0.2)',
                                },
                            }}
                        >
                            <Star width={16} height={16} color="#9e9e9e" />
                        </Box>
                    </Tooltip>
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
                {dataPlane.cloudProvider} &middot; {dataPlane.region} &middot;{' '}
                {dataPlane.scope}
            </Typography>
        </Box>
    );
}

export default function DataPlanesCard() {
    const { watch, setValue } = useFormContext<StorageMappingFormData>();
    const { dataPlanes: allDataPlanes } = useDataPlanes();

    const selectedDataPlanes = watch('data_planes');
    const unselectedDataPlanes = useMemo(
        () =>
            allDataPlanes.filter(
                (dp) =>
                    !selectedDataPlanes.some(
                        (selected) =>
                            selected.dataPlaneName === dp.dataPlaneName
                    )
            ),
        [allDataPlanes, selectedDataPlanes]
    );
    const defaultDataPlane = watch('default_data_plane');
    const allowPublicChecked = watch('allow_public');
    const effectiveAllowPublic =
        allowPublicChecked ||
        selectedDataPlanes.some((dp) => dp.isPublic) ||
        unselectedDataPlanes.every((dp) => dp.isPublic);

    useEffect(() => {
        if (selectedDataPlanes.length > 0 && !defaultDataPlane) {
            setValue('default_data_plane', selectedDataPlanes[0]);
        }
    }, [selectedDataPlanes, defaultDataPlane, setValue]);

    const [adding, setAdding] = useState(selectedDataPlanes.length === 0);

    useEffect(() => {
        if (selectedDataPlanes.length > 0) {
            setAdding(false);
        }
    }, [selectedDataPlanes.length]);

    const allDataPlaneNames = selectedDataPlanes.map((dp) => dp.dataPlaneName);

    const hasMoreOptions = unselectedDataPlanes.length > 0;

    const availableOptions = useMemo(
        () =>
            allDataPlanes
                .filter((dp) => {
                    if (allDataPlaneNames.includes(dp.dataPlaneName))
                        return false;

                    return effectiveAllowPublic || !dp.isPublic;
                })
                .sort((a, b) => {
                    if (a.isPublic !== b.isPublic) {
                        return a.isPublic ? 1 : -1;
                    }
                    return a.dataPlaneName.localeCompare(b.dataPlaneName);
                }),
        [allDataPlanes, effectiveAllowPublic, allDataPlaneNames]
    );

    const [addingId, setAddingId] = useState<string | null>(null);

    const handleAccept = (dataPlane: DataPlaneNode) => {
        const formDataPlane: FormDataPlane = { ...dataPlane, _isNew: true };
        setAddingId(dataPlane.dataPlaneName);
        setValue('data_planes', [...selectedDataPlanes, formDataPlane]);
        setAdding(false);
    };

    useEffect(() => {
        if (!addingId) return;
        const frame = requestAnimationFrame(() => setAddingId(null));
        return () => cancelAnimationFrame(frame);
    }, [addingId]);

    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = (dataPlaneName: string) => {
        setRemovingId(dataPlaneName);
    };

    const handleRemoveExited = useCallback(() => {
        if (!removingId) return;

        const removed = selectedDataPlanes.find(
            (dp) => dp.dataPlaneName === removingId
        );
        setValue(
            'data_planes',
            selectedDataPlanes.filter((dp) => dp.dataPlaneName !== removingId)
        );

        if (removed?.dataPlaneName === defaultDataPlane?.dataPlaneName) {
            setValue('default_data_plane', null);
        }

        setRemovingId(null);
    }, [removingId, selectedDataPlanes, defaultDataPlane, setValue]);

    const effectiveDefault =
        defaultDataPlane?.dataPlaneName ?? selectedDataPlanes[0]?.dataPlaneName;

    return (
        <CardWrapper>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <Typography sx={cardHeaderSx}>Data Planes</Typography>
                <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    onClick={() => setAdding(true)}
                    sx={{
                        opacity:
                            adding ||
                            selectedDataPlanes.length === 0 ||
                            !hasMoreOptions
                                ? 0.5
                                : 1,
                        pointerEvents:
                            adding ||
                            selectedDataPlanes.length === 0 ||
                            !hasMoreOptions
                                ? 'none'
                                : 'auto',
                    }}
                >
                    Add data plane
                </Link>
            </Box>
            <Stack spacing={0.25}>
                <Flipper
                    flipKey={`${selectedDataPlanes.length}-${selectedDataPlanes
                        .map((dp) => dp.dataPlaneName)
                        .join(',')}`}
                >
                    <Box>
                        {selectedDataPlanes.map((dp) => {
                            return (
                                <Collapse
                                    key={dp.dataPlaneName}
                                    in={
                                        dp.dataPlaneName !== removingId &&
                                        dp.dataPlaneName !== addingId
                                    }
                                    onExited={handleRemoveExited}
                                    unmountOnExit
                                >
                                    <Flipped flipId={dp.dataPlaneName}>
                                        <Box
                                            sx={{
                                                'display': 'flex',
                                                'alignItems': 'center',
                                                'gap': 0.5,
                                                'mb': 1,
                                                '&:hover .star-outline': {
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <DataPlaneRow
                                                    dataPlane={dp}
                                                    isDefault={
                                                        dp.dataPlaneName ===
                                                        effectiveDefault
                                                    }
                                                    handleSetDefault={() => {
                                                        setValue(
                                                            'default_data_plane',
                                                            dp
                                                        );
                                                        setTimeout(() => {
                                                            setValue(
                                                                'data_planes',
                                                                [
                                                                    dp,
                                                                    ...selectedDataPlanes.filter(
                                                                        (s) =>
                                                                            s.dataPlaneName !==
                                                                            dp.dataPlaneName
                                                                    ),
                                                                ]
                                                            );
                                                        }, 350);
                                                    }}
                                                />
                                            </Box>

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleRemove(
                                                        dp.dataPlaneName
                                                    )
                                                }
                                            >
                                                <Xmark width={16} height={16} />
                                            </IconButton>
                                        </Box>
                                    </Flipped>
                                </Collapse>
                            );
                        })}
                    </Box>
                </Flipper>
                <Collapse
                    in={adding || selectedDataPlanes.length === 0}
                    unmountOnExit
                >
                    <Stack
                        spacing={1}
                        direction="row"
                        alignItems="end"
                        sx={{ px: 1 }}
                    >
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Data Plane</InputLabel>
                            <Select
                                value=""
                                label="Data Plane"
                                onChange={(e) => {
                                    const node = allDataPlanes.find(
                                        (dp) =>
                                            dp.dataPlaneName === e.target.value
                                    );
                                    if (node) {
                                        handleAccept(node);
                                    }
                                }}
                            >
                                {availableOptions.map((dp) => (
                                    <MenuItem
                                        key={dp.dataPlaneName}
                                        value={dp.dataPlaneName}
                                    >
                                        {toPresentableName(dp)} ({dp.scope})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {allDataPlanes.some((dp) => dp.isPublic) ? (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={effectiveAllowPublic}
                                        disabled={
                                            selectedDataPlanes.some(
                                                (dp) => dp.isPublic
                                            ) ||
                                            unselectedDataPlanes.every(
                                                (dp) => dp.isPublic
                                            )
                                        }
                                        onChange={(e) =>
                                            setValue(
                                                'allow_public',
                                                e.target.checked
                                            )
                                        }
                                        size="small"
                                    />
                                }
                                label="Allow public"
                                slotProps={{
                                    typography: { variant: 'body2' },
                                }}
                                sx={{ whiteSpace: 'nowrap' }}
                            />
                        ) : null}
                    </Stack>
                </Collapse>
            </Stack>
        </CardWrapper>
    );
}
