import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';
import type { AutoCompleteOption } from 'src/components/incompatibleSchemaChange/types';


export const choices = [
    'abort',
    'backfill',
    'disableBinding',
    'disableTask',
] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
