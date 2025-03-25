import type { AutoCompleteOption } from './types';
import { getTypedAutoCompleteDefaults } from 'components/shared/AutoComplete/DefaultProps';

export const choices = ['leaveEmpty', 'fromSourceName'] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
