import { ButtonGroup, Stack } from '@mui/material';
import DeleteButton from 'components/tables/RowActions/Delete/Button';
import DisableEnableButton from 'components/tables/RowActions/DisableEnable/Button';
import Materialize from 'components/tables/RowActions/Materialize';
import { useZustandStore } from 'context/Zustand/provider';
import { useIntl } from 'react-intl';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import RowSelectorCheckBox from './RowSelectorCheckBox';
import Transform from './Transform';
import { RowSelectorProps } from './types';

function RowSelector({
    hideActions,
    selectKeyValueName,
    selectableTableStoreName = SelectTableStoreNames.CAPTURE,
    showMaterialize,
    showSelectedCount,
    showTransform,
}: RowSelectorProps) {
    const intl = useIntl();

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.get);

    const disableMultiSelect = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['disableMultiSelect']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.disableMultiSelect.get
    );

    const hasSelections = selectedRows.size > 0;

    return (
        <Stack direction="row" spacing={2}>
            {disableMultiSelect ? null : (
                <RowSelectorCheckBox
                    showSelectedCount={showSelectedCount}
                    selectableTableStoreName={selectableTableStoreName}
                    selectKeyValueName={selectKeyValueName}
                />
            )}

            {hideActions ? null : (
                <ButtonGroup
                    aria-label={intl.formatMessage({
                        id: 'capturesTable.ctaGroup.aria',
                    })}
                    disableElevation
                    disabled={!hasSelections}
                >
                    <DisableEnableButton
                        selectableTableStoreName={selectableTableStoreName}
                        enabling={true}
                    />

                    <DisableEnableButton
                        selectableTableStoreName={selectableTableStoreName}
                        enabling={false}
                    />

                    <DeleteButton
                        selectableTableStoreName={selectableTableStoreName}
                    />
                </ButtonGroup>
            )}

            {showMaterialize ? (
                <Materialize
                    selectableTableStoreName={selectableTableStoreName}
                />
            ) : null}

            {showTransform ? (
                <Transform
                    selectableTableStoreName={selectableTableStoreName}
                />
            ) : null}
        </Stack>
    );
}

export default RowSelector;
