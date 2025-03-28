import { RadioGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';
import { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuOptions() {
    const intl = useIntl();

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
            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.recommended.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.recommended.label',
                })}
                value="recommended"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.excludeAll.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.excludeAll.label',
                })}
                value="excludeAll"
            />
        </RadioGroup>
    );
}
