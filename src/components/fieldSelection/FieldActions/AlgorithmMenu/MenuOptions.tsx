import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

import { RadioGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';
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
                    id: 'fieldSelection.massActionMenu.depthZero.description',
                })}
                descriptionTextTransform="none"
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthZero.label',
                })}
                value="depthZero"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthOne.description',
                })}
                descriptionTextTransform="none"
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthOne.label',
                })}
                value="depthOne"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthTwo.description',
                })}
                descriptionTextTransform="none"
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthTwo.label',
                })}
                value="depthTwo"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthUnlimited.description',
                })}
                descriptionTextTransform="none"
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthUnlimited.label',
                })}
                value="depthUnlimited"
            />
        </RadioGroup>
    );
}
