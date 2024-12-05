import { getTypedAutoCompleteDefaults } from 'components/shared/AutoComplete/DefaultProps';
import { AutoCompleteOption } from './types';

export const choices = ['leaveEmpty', 'fromSourceName'] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
