import { getAutoCompleteDefaults } from 'components/shared/AutoComplete/DefaultProps';
import { AutoCompleteOption } from './types';

export const choices = [
    'abort',
    'backfill',
    'disableBinding',
    'disableTask',
] as const;

export const autoCompleteDefaultProps =
    getAutoCompleteDefaults<AutoCompleteOption>();
