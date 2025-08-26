import type { AutoCompleteOptionForIncompatibleSchemaChange } from 'src/components/incompatibleSchemaChange/types';

import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';

export const choices = [
    'abort',
    'backfill',
    'disableBinding',
    'disableTask',
] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOptionForIncompatibleSchemaChange>();

export const TARGET_SCHEMA_HIGHLIGHT_CLASS =
    'est-highlight-example-table-prefix';
