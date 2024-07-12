import { Stack } from '@mui/material';
import { useBinding_recommendFields } from 'stores/Binding/hooks';
import FieldActionButton from './FieldActionButton';
import { CompositeProjection } from './types';

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

    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FieldActionButton
                bindingUUID={bindingUUID}
                disabled={!recommended[bindingUUID] || loading}
                labelId="fieldSelection.table.cta.defaultField"
                projections={projections}
                selectedValue="default"
            />

            <FieldActionButton
                bindingUUID={bindingUUID}
                disabled={loading}
                labelId="fieldSelection.table.cta.excludeAllFields"
                projections={projections}
                selectedValue="exclude"
            />
        </Stack>
    );
}
