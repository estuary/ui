import type { autoCompleteDefaults_Virtual_Multiple } from 'src/components/shared/AutoComplete/DefaultProps';
import type { FieldExistence } from 'src/types';

export type OnChange =
    (typeof autoCompleteDefaults_Virtual_Multiple)['onChange'];

export type FieldFilter = 'ALL' | FieldExistence;

export interface AutoCompleteOptionForExistFilter {
    id: FieldFilter;
    label: string;
}
