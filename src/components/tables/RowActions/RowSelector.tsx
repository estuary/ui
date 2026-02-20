import type { RowSelectorProps } from 'src/components/tables/RowActions/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { ButtonGroup, Grid, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import DeleteButton from 'src/components/tables/RowActions/Delete/Button';
import DisableEnableButton from 'src/components/tables/RowActions/DisableEnable/Button';
import Materialize from 'src/components/tables/RowActions/Materialize';
import RowSelectorCheckBox from 'src/components/tables/RowActions/RowSelectorCheckBox';
import Transform from 'src/components/tables/RowActions/Transform';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';

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

            <Grid container alignItems="center" gap={1}>
                {hideActions ? null : (
                    <Grid>
                        <ButtonGroup
                            aria-label={intl.formatMessage({
                                id: 'capturesTable.ctaGroup.aria',
                            })}
                            disableElevation
                            disabled={!hasSelections}
                        >
                            <DisableEnableButton
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                                enabling={true}
                            />

                            <DisableEnableButton
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                                enabling={false}
                            />

                            <DeleteButton
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                            />
                        </ButtonGroup>
                    </Grid>
                )}

                {showMaterialize ? (
                    <Grid>
                        <Materialize
                            selectableTableStoreName={selectableTableStoreName}
                        />
                    </Grid>
                ) : null}

                {showTransform ? (
                    <Grid>
                        <Transform
                            selectableTableStoreName={selectableTableStoreName}
                        />
                    </Grid>
                ) : null}
            </Grid>
        </Stack>
    );
}

export default RowSelector;
