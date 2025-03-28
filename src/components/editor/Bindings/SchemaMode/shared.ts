import { AutoCompleteOption } from './types';

import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';

export const choices = ['leaveEmpty', 'fromSourceName'] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
