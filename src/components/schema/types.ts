import type { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import type { InferSchemaResponseProperty } from 'types';

export type OnChange =
    (typeof autoCompleteDefaults_Virtual_Multiple)['onChange'];

export type FieldFilter = 'all' | InferSchemaResponseProperty['exists'];

export interface AutoCompleteOption {
    id: FieldFilter;
    label: string;
}
