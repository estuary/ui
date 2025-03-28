import { ToggleButtonGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';
import { useZustandStore } from 'src/context/Zustand/provider';
import type {
    SelectableTableStore} from 'src/stores/Tables/Store';
import {
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';
import { selectableTableStoreName } from 'src/components/tables/DataPlanes/shared';

function ToggleDataPlaneScope() {
    const intl = useIntl();

    const { dataPlaneScope, toggleScope } = useDataPlaneScope();

    const setHydrated = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setHydrated']
    >(selectableTableStoreName, selectableTableStoreSelectors.hydrated.set);

    const changeScope = () => {
        // TODO (table filters)
        // This is a hack but also not... cause it is a shared store. However, we should probably make the filtering
        //  that is used for the search input shared. Then we can utilize a lot of the same helper functions when
        //  building out filter buttons, lists, switches, etc. like this one and not manually setting stuff.

        // forces the table to display in loading mode
        setHydrated(false);
        toggleScope();
    };

    return (
        <ToggleButtonGroup
            color="primary"
            size="small"
            exclusive
            value={dataPlaneScope}
        >
            <OutlinedToggleButton
                onClick={changeScope}
                selected={dataPlaneScope === 'private'}
                size="small"
                value="private"
            >
                {intl.formatMessage({
                    id: 'admin.dataPlanes.private.option',
                })}
            </OutlinedToggleButton>
            <OutlinedToggleButton
                onClick={changeScope}
                selected={dataPlaneScope === 'public'}
                size="small"
                value="public"
            >
                {intl.formatMessage({
                    id: 'admin.dataPlanes.public.option',
                })}
            </OutlinedToggleButton>
        </ToggleButtonGroup>
    );
}

export default ToggleDataPlaneScope;
