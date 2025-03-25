import type { CompositeProjection } from './types';
import { Stack } from '@mui/material';
import { useBinding_recommendFields } from 'stores/Binding/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';
import FieldActionButton from './FieldActionButton';

interface Props {
    bindingUUID: string;
    loading: boolean;
    projections: CompositeProjection[] | null | undefined;
}

export default function FieldActions({
    bindingUUID,
    loading,
    projections,
}: Props) {
    const recommended = useBinding_recommendFields();

    const formActive = useFormStateStore_isActive();

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FieldActionButton
                bindingUUID={bindingUUID}
                disabled={
                    !recommended[bindingUUID] ||
                    loading ||
                    formActive ||
                    !hasLength(projections)
                }
                labelId="fieldSelection.table.cta.defaultField"
                projections={projections}
                selectedValue="default"
            />

            <FieldActionButton
                bindingUUID={bindingUUID}
                disabled={loading || formActive || !hasLength(projections)}
                labelId="fieldSelection.table.cta.excludeAllFields"
                projections={projections}
                selectedValue="exclude"
            />
        </Stack>
    );
}
