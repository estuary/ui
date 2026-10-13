import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { useCallback, useMemo, useState } from 'react';

import { Collapse } from '@mui/material';

import { useIntl } from 'react-intl';

import { DataPlaneRow } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard/DataPlaneRow';
import { DataPlaneSelector } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard/DataPlaneSelector';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';
import { List, ListItem } from 'src/components/shared/List';
import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';

interface DataPlanesCardProps {
    selectedNames: string[];
    defaultName?: string;
    allowPublicChecked: boolean;
    onSelect: (dataPlane: DataPlaneNode) => void;
    onRemove: (index: number) => void;
    onSelectDefault: (index: number) => void;
    onToggleAllowPublic: (value: boolean) => void;
}

export function DataPlanesCard({
    selectedNames,
    defaultName,
    allowPublicChecked,
    onSelect,
    onRemove,
    onSelectDefault,
    onToggleAllowPublic,
}: DataPlanesCardProps) {
    const intl = useIntl();
    const { dataPlanes } = useDataPlanes();
    const [selectorIsOpen, setSelectorIsOpen] = useState(false);

    // users shouldn't add storage mappings to closed data planes
    const openDataPlanes = useMemo(
        () => dataPlanes.filter((dp) => !dp.closed),
        [dataPlanes]
    );

    const defaultDp = useMemo(() => {
        return openDataPlanes.find((dp) => dp.name === defaultName);
    }, [openDataPlanes, defaultName]);

    const selectedDps = useMemo(() => {
        return selectedNames
            .map((name) => openDataPlanes.find((dp) => dp.name === name))
            .filter(Boolean) as DataPlaneNode[];
    }, [openDataPlanes, selectedNames]);

    const [unselectedDps, hasMoreOptions] = useMemo(() => {
        const unselected = openDataPlanes.filter(
            (dp) => !selectedNames.includes(dp.name)
        );
        return [unselected, unselected.length > 0];
    }, [openDataPlanes, selectedNames]);

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
            <List spacing={1}>
                {selectedDps.map((dp, index) => (
                    <ListItem key={dp.name}>
                        <DataPlaneRow
                            dataPlane={dp}
                            isDefault={dp.name === defaultDp?.name}
                            handleSetDefault={() => onSelectDefault(index)}
                            handleRemove={() => handleRemove(index)}
                        />
                    </ListItem>
                ))}
            </List>
            <Collapse in={effectiveSelectorIsOpen}>
                <DataPlaneSelector
                    options={availableOptions}
                    allowPublicVisible={openDataPlanes.some(
                        (dp) => dp.isPublic
                    )}
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
