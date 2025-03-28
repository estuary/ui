import { getTypedAutoCompleteDefaults } from 'src/components/shared/AutoComplete/DefaultProps';
import type { AutoCompleteOption } from 'src/components/editor/Bindings/SchemaMode/types';


export const choices = ['leaveEmpty', 'fromSourceName'] as const;

export const autoCompleteDefaultProps =
    getTypedAutoCompleteDefaults<AutoCompleteOption>();
