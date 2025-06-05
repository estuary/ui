import type { TableSettingsState } from 'src/context/TableSettings';
import type { TableColumns } from 'src/types';

import { TablePrefixes } from 'src/stores/Tables/hooks';
import { evaluateColumnsToShow } from 'src/utils/table-utils';

describe('evaluateColumnsToShow', () => {
    const TABLE_PREFIX = TablePrefixes.fieldSelection;
    const optionalColumns = ['label.column_B', 'label.column_D'];

    const tableColumns: TableColumns[] = [
        { field: 'A', headerIntlKey: 'label.column_A' },
        { field: 'B', headerIntlKey: 'label.column_B' },
        { field: 'C', headerIntlKey: 'label.column_C' },
        { field: 'D', headerIntlKey: 'label.column_D' },
        { field: null, headerIntlKey: 'label.column_E' },
    ];

    test('returns only required columns when the skipSettingsCheck is falsey and shownOptionalColumns table setting is empty', () => {
        const tableSettings: TableSettingsState['tableSettings'] = {
            [TABLE_PREFIX]: {
                shownOptionalColumns: [],
            },
        };

        expect(
            evaluateColumnsToShow(
                optionalColumns,
                tableColumns,
                TABLE_PREFIX,
                tableSettings
            )
        ).toStrictEqual([
            { field: 'A', headerIntlKey: 'label.column_A' },
            { field: 'C', headerIntlKey: 'label.column_C' },
            { field: null, headerIntlKey: 'label.column_E' },
        ]);
    });

    test('returns required and visible optional columns when the skipSettingsCheck is falsey and shownOptionalColumns table setting is non-empty', () => {
        const tableSettings: TableSettingsState['tableSettings'] = {
            [TABLE_PREFIX]: {
                shownOptionalColumns: ['label.column_D'],
            },
        };

        expect(
            evaluateColumnsToShow(
                optionalColumns,
                tableColumns,
                TABLE_PREFIX,
                tableSettings
            )
        ).toStrictEqual([
            { field: 'A', headerIntlKey: 'label.column_A' },
            { field: 'C', headerIntlKey: 'label.column_C' },
            { field: 'D', headerIntlKey: 'label.column_D' },
            { field: null, headerIntlKey: 'label.column_E' },
        ]);
    });

    describe('returns all columns', () => {
        test('when table settings are undefined', () => {
            expect(
                evaluateColumnsToShow(
                    optionalColumns,
                    tableColumns,
                    TABLE_PREFIX,
                    undefined
                )
            ).toStrictEqual(tableColumns);
        });

        test('when table settings are not defined for a given table prefix', () => {
            const tableSettings: TableSettingsState['tableSettings'] = {
                [TablePrefixes.schemaViewer]: {
                    shownOptionalColumns: ['random'],
                },
            };

            expect(
                evaluateColumnsToShow(
                    optionalColumns,
                    tableColumns,
                    TABLE_PREFIX,
                    tableSettings
                )
            ).toStrictEqual(tableColumns);

            expect(
                evaluateColumnsToShow(
                    optionalColumns,
                    tableColumns,
                    TABLE_PREFIX,
                    {}
                )
            ).toStrictEqual(tableColumns);
        });

        test('when skipSettingsCheck is true', () => {
            const tableSettings: TableSettingsState['tableSettings'] = {
                [TABLE_PREFIX]: {
                    shownOptionalColumns: [],
                },
            };

            expect(
                evaluateColumnsToShow(
                    optionalColumns,
                    tableColumns,
                    TABLE_PREFIX,
                    tableSettings,
                    true
                )
            ).toStrictEqual(tableColumns);
        });
    });
});
