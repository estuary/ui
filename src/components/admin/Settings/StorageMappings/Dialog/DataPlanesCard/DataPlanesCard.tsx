import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Collapse, Stack } from '@mui/material';

import { Flipped, Flipper } from 'react-flip-toolkit';
import { useIntl } from 'react-intl';

import { useDataPlanes } from 'src/api/gql/dataPlanes';
import { DataPlaneRow } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard/DataPlaneRow';
import { DataPlaneSelector } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard/DataPlaneSelector';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';

interface DataPlanesCardProps {
    dataPlanes: DataPlaneNode[];
    defaultDataPlane: DataPlaneNode | null;
    allowPublicChecked: boolean;
    onSelect: (dataPlane: DataPlaneNode) => void;
    onRemove: (index: number) => void;
    onSelectDefault: (index: number) => void;
    onToggleAllowPublic: (value: boolean) => void;
}

function names(dataPlanes: DataPlaneNode[]): Set<string> {
    return new Set(dataPlanes.map((dp) => dp.name));
}

export function DataPlanesCard({
    dataPlanes: selectedDps,
    defaultDataPlane: defaultDp,
    allowPublicChecked,
    onSelect,
    onRemove,
    onSelectDefault,
    onToggleAllowPublic,
}: DataPlanesCardProps) {
    const intl = useIntl();
    const { dataPlanes: allDps } = useDataPlanes();

    const [selectorIsOpen, setSelectorIsOpen] = useState(false);

    // Track incoming prop changes to enable enter/exit animations
    const [prevSelected, setPrevSelected] = useState(selectedDps);
    const [incomingNames, setIncomingNames] = useState<Set<string>>(new Set());
    const [outgoingDps, setOutgoingDps] = useState<DataPlaneNode[]>([]);
    const outgoingNames = useMemo(() => names(outgoingDps), [outgoingDps]);

    const [unselectedDps, hasMoreOptions] = useMemo(() => {
        const selectedNames = names(selectedDps);
        const unselected = allDps.filter((dp) => !selectedNames.has(dp.name));
        return [unselected, unselected.length > 0];
    }, [allDps, selectedDps]);

    const effectiveAllowPublic =
        allowPublicChecked ||
        selectedDps.some((dp) => dp.isPublic) ||
        unselectedDps.every((dp) => dp.isPublic);

    const effectiveSelectorIsOpen = selectorIsOpen || selectedDps.length === 0;

    const availableOptions = useMemo(
        () =>
            unselectedDps
                .filter((dp) => effectiveAllowPublic || !dp.isPublic)
                .sort((a, b) => {
                    if (a.isPublic !== b.isPublic) {
                        return a.isPublic ? 1 : -1;
                    }
                    return a.name.localeCompare(b.name);
                }),
        [unselectedDps, effectiveAllowPublic]
    );

    const handleAccept = (dataPlane: DataPlaneNode) => {
        onSelect(dataPlane);
        setSelectorIsOpen(false);
    };

    const handleRemove = useCallback(
        (index: number) => {
            onRemove(index);
            if (selectedDps.length <= 1) {
                setSelectorIsOpen(true);
            }
        },
        [selectedDps, onRemove]
    );

    const onExitAnimationComplete = useCallback((dataPlaneName: string) => {
        setOutgoingDps((prev) =>
            prev.filter((dp) => dp.name !== dataPlaneName)
        );
    }, []);

    // Detect changes to the prop during render
    if (prevSelected !== selectedDps) {
        setPrevSelected(selectedDps);
        const prevNames = names(prevSelected);
        const nextNames = names(selectedDps);

        // Snapshot removed items for exit animation
        const removed = prevSelected.filter((dp) => !nextNames.has(dp.name));
        if (removed.length > 0) {
            setOutgoingDps((prev) => [...prev, ...removed]);
        }

        // Detect additions for enter animation
        const added = selectedDps.filter((dp) => !prevNames.has(dp.name));
        if (added.length > 0) {
            setIncomingNames(names(added));
        }
    }

    // Render list: current prop items + items still animating out
    const renderList = useMemo(() => {
        const selectedNames = names(selectedDps);
        return [
            ...selectedDps,
            ...outgoingDps.filter((dp) => !selectedNames.has(dp.name)),
        ];
    }, [selectedDps, outgoingDps]);

    // Items mount with Collapse `in={false}`, then this clears incomingIds
    // on the next frame so they transition to `in={true}` and animate open.
    useEffect(() => {
        if (incomingNames.size === 0) return;
        const frame = requestAnimationFrame(() => setIncomingNames(new Set()));
        return () => cancelAnimationFrame(frame);
    }, [incomingNames]);

    return (
        <>
            <CardTitle
                title={intl.formatMessage({
                    id: 'storageMappings.dialog.dataPlanes.title',
                })}
                action={intl.formatMessage({
                    id: 'storageMappings.dialog.dataPlanes.addAction',
                })}
                onAction={() => setSelectorIsOpen(true)}
                actionDisabled={effectiveSelectorIsOpen || !hasMoreOptions}
            />
            <Flipper
                flipKey={`${renderList.length}-${renderList
                    .map((dp) => dp.name)
                    .join(',')}`}
            >
                <Stack spacing={1}>
                    {renderList.map((dp, index) => {
                        const name = dp.name;
                        const visible =
                            !outgoingNames.has(name) &&
                            !incomingNames.has(name);
                        return (
                            <Flipped key={name} flipId={name}>
                                <Collapse
                                    in={visible}
                                    onExited={() =>
                                        onExitAnimationComplete(name)
                                    }
                                    unmountOnExit
                                >
                                    <DataPlaneRow
                                        dataPlane={dp}
                                        isDefault={name === defaultDp?.name}
                                        handleSetDefault={() =>
                                            onSelectDefault(index)
                                        }
                                        handleRemove={() => handleRemove(index)}
                                    />
                                </Collapse>
                            </Flipped>
                        );
                    })}
                </Stack>
            </Flipper>
            <Collapse in={effectiveSelectorIsOpen}>
                <DataPlaneSelector
                    options={availableOptions}
                    allowPublicVisible={allDps.some((dp) => dp.isPublic)}
                    allowPublicChecked={effectiveAllowPublic}
                    allowPublicDisabled={
                        selectedDps.some((dp) => dp.isPublic) ||
                        unselectedDps.every((dp) => dp.isPublic)
                    }
                    onAccept={handleAccept}
                    onToggleAllowPublic={onToggleAllowPublic}
                />
            </Collapse>
        </>
    );
}
