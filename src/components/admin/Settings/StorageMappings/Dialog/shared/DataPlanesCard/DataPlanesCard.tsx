import type { DataPlaneNode } from 'src/api/dataPlanesGql';
import type { FormDataPlane } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Collapse, Stack } from '@mui/material';

import DataPlaneRow from './DataPlaneRow';
import DataPlaneSelector from './DataPlaneSelector';
import { Flipped, Flipper } from 'react-flip-toolkit';

import { useDataPlanes } from 'src/api/dataPlanesGql';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';

interface DataPlanesCardProps {
    dataPlanes: FormDataPlane[];
    defaultDataPlane: FormDataPlane | null;
    allowPublicChecked: boolean;
    onSelect: (dataPlane: FormDataPlane) => void;
    onRemove: (index: number) => void;
    onSelectDefault: (index: number) => void;
    onToggleAllowPublic: (value: boolean) => void;
}

function names(dataPlanes: DataPlaneNode[]): Set<string> {
    return new Set(dataPlanes.map((dp) => dp.dataPlaneName));
}

export default function DataPlanesCard({
    dataPlanes: selectedDps,
    defaultDataPlane: defaultDp,
    allowPublicChecked,
    onSelect,
    onRemove,
    onSelectDefault,
    onToggleAllowPublic,
}: DataPlanesCardProps) {
    const { dataPlanes: allDps } = useDataPlanes();

    const [selectorIsOpen, setSelectorIsOpen] = useState(false);

    // Track incoming prop changes to enable enter/exit animations
    const [prevSelected, setPrevSelected] = useState(selectedDps);
    const [incomingNames, setIncomingNames] = useState<Set<string>>(new Set());
    const [outgoingDps, setOutgoingDps] = useState<FormDataPlane[]>([]);
    const outgoingNames = useMemo(() => names(outgoingDps), [outgoingDps]);

    const [unselectedDps, hasMoreOptions] = useMemo(() => {
        const selectedNames = names(selectedDps);
        const unselected = allDps.filter(
            (dp) => !selectedNames.has(dp.dataPlaneName)
        );
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
                    return a.dataPlaneName.localeCompare(b.dataPlaneName);
                }),
        [unselectedDps, effectiveAllowPublic]
    );

    const handleAccept = (dataPlane: DataPlaneNode) => {
        onSelect({ ...dataPlane, _isNew: true });
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
            prev.filter((dp) => dp.dataPlaneName !== dataPlaneName)
        );
    }, []);

    // Detect changes to the prop during render
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    if (prevSelected !== selectedDps) {
        setPrevSelected(selectedDps);
        const prevNames = names(prevSelected);
        const nextNames = names(selectedDps);

        // Snapshot removed items for exit animation
        const removed = prevSelected.filter(
            (dp) => !nextNames.has(dp.dataPlaneName)
        );
        if (removed.length > 0) {
            setOutgoingDps((prev) => [...prev, ...removed]);
        }

        // Detect additions for enter animation
        const added = selectedDps.filter(
            (dp) => !prevNames.has(dp.dataPlaneName)
        );
        if (added.length > 0) {
            setIncomingNames(names(added));
        }
    }

    // Render list: current prop items + items still animating out
    const renderList = useMemo(() => {
        const selectedNames = names(selectedDps);
        return [
            ...selectedDps,
            ...outgoingDps.filter((dp) => !selectedNames.has(dp.dataPlaneName)),
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
                title="Data Planes"
                action="Add data plane"
                onAction={() => setSelectorIsOpen(true)}
                actionDisabled={effectiveSelectorIsOpen || !hasMoreOptions}
            />
            <Flipper
                flipKey={`${renderList.length}-${renderList
                    .map((dp) => dp.dataPlaneName)
                    .join(',')}`}
            >
                <Stack spacing={1}>
                    {renderList.map((dp, index) => {
                        const name = dp.dataPlaneName;
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
                                        isDefault={
                                            name === defaultDp?.dataPlaneName
                                        }
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
