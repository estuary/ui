import { RadioGroup } from '@mui/material';
import { SelectionAlgorithm } from 'stores/Binding/slices/FieldSelection';
import { useBindingStore } from 'stores/Binding/Store';
import MenuOption from './MenuOption';

export default function MenuOptions() {
    const selectionAlgorithm = useBindingStore(
        (state) => state.selectionAlgorithm
    );
    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    return (
        <RadioGroup
            onChange={(event) =>
                setSelectionAlgorithm(event.target.value as SelectionAlgorithm)
            }
            value={selectionAlgorithm}
            style={{ maxWidth: 320, textWrap: 'wrap' }}
        >
            <MenuOption
                descriptionId="fieldSelection.massActionMenu.recommended.description"
                labelId="fieldSelection.massActionMenu.recommended.label"
                value="recommended"
            />

            <MenuOption
                descriptionId="fieldSelection.massActionMenu.excludeAll.description"
                labelId="fieldSelection.massActionMenu.excludeAll.label"
                value="excludeAll"
            />
        </RadioGroup>
    );
}
