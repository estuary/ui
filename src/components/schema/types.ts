import type { autoCompleteDefaults_Virtual_Multiple } from 'src/components/shared/AutoComplete/DefaultProps';
import type { BuiltProjectionInference } from 'src/types/schemaModels';

export type OnChange =
    (typeof autoCompleteDefaults_Virtual_Multiple)['onChange'];

export type FieldFilter = 'all' | BuiltProjectionInference['exists'];

export interface AutoCompleteOptionForExistFilter {
    id: FieldFilter;
    label: string;
}

export interface ExistFilterProps {
    fieldFilter: FieldFilter;
    setFieldFilter: (value: FieldFilter) => void;
    disabled?: boolean;
}
