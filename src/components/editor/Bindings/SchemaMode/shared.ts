import type { AutoCompleteOption } from 'src/components/editor/Bindings/SchemaMode/types';

import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';

export const choices = ['leaveEmpty', 'fromSourceName'] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
