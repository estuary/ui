import type { autoCompleteDefaults_Virtual_Multiple } from 'src/components/shared/AutoComplete/DefaultProps';
import type { InferSchemaResponseProperty } from 'src/types';

export type OnChange =
    (typeof autoCompleteDefaults_Virtual_Multiple)['onChange'];

export type FieldFilter = 'all' | InferSchemaResponseProperty['exists'];

export interface AutoCompleteOptionForExistFilter {
    id: FieldFilter;
    label: string;
}
