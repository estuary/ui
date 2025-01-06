import { getTypedAutoCompleteDefaults } from 'components/shared/AutoComplete/DefaultProps';
import { AutoCompleteOption } from './types';

export const choices = [
    'abort',
    'backfill',
    'disableBinding',
    'disableTask',
] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
