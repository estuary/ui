import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import { useMemo, useState } from 'react';

import { Box, Collapse, Typography } from '@mui/material';

import { DataPlaneSelector } from 'src/components/admin/Settings/StorageMappings/Dialog/DataPlanesCard/DataPlaneSelector';
import { CardTitle } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/CardTitle';
import { PrimaryList } from 'src/components/shared/PrimaryList';
import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';
import { getScope, toPresentableName } from 'src/utils/dataPlane-utils';

interface DataPlanesCardProps {
    dataPlanes: DataPlaneNode[];
    allowPublicChecked: boolean;
    onSelect: (dataPlane: DataPlaneNode) => void;
    onChange: (dataPlanes: DataPlaneNode[]) => void;
    onToggleAllowPublic: (value: boolean) => void;
}

function names(dataPlanes: DataPlaneNode[]): Set<string> {
    return new Set(dataPlanes.map((dp) => dp.name));
}

export function DataPlanesCard({
    dataPlanes: selectedDps,
    allowPublicChecked,
    onSelect,
    onChange,
    onToggleAllowPublic,
}: DataPlanesCardProps) {
    const { dataPlanes } = useDataPlanes();

    // users shouldn't add storage mappings to closed data planes
    const openDataPlanes = useMemo(
        () => dataPlanes.filter((dp) => !dp.closed),
        [dataPlanes]
    );

    const [selectorIsOpen, setSelectorIsOpen] = useState(false);

    const [unselectedDps, hasMoreOptions] = useMemo(() => {
        const selectedNames = names(selectedDps);
        const unselected = openDataPlanes.filter(
            (dp) => !selectedNames.has(dp.name)
        );
        return [unselected, unselected.length > 0];
    }, [openDataPlanes, selectedDps]);

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

    return (
        <Box>
            <CardTitle
                title="Data Planes"
                action="Add data plane"
                onAction={() => setSelectorIsOpen(true)}
                actionDisabled={effectiveSelectorIsOpen || !hasMoreOptions}
            />
            <Collapse in={selectedDps.length > 0} unmountOnExit>
                <PrimaryList
                    sx={{ pt: 2 }}
                    items={selectedDps}
                    onChange={onChange}
                    renderLabel={toPresentableName}
                    renderKey={(dp) => dp.name}
                    renderBody={(dp) => (
                        <Typography
                            variant="caption"
                            color={
                                dp.isPublic ? 'text.disabled' : 'text.primary'
                            }
                        >
                            {getScope(dp)}
                        </Typography>
                    )}
                />
            </Collapse>
            <Collapse in={effectiveSelectorIsOpen}>
                <Box sx={{ pt: 2 }}>
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
                </Box>
            </Collapse>
        </Box>
    );
}
