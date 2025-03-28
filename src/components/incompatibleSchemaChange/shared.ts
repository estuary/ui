import { AutoCompleteOption } from './types';

import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';

export const choices = [
    'abort',
    'backfill',
    'disableBinding',
    'disableTask',
] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
