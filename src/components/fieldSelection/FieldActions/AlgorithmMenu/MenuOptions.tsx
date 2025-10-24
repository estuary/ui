import type { MenuOptionsProps } from 'src/components/fieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

import { RadioGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuOptions({ bindingUUID }: MenuOptionsProps) {
    const intl = useIntl();

    const selectionAlgorithm = useBindingStore((state) =>
        bindingUUID
            ? state.selections[bindingUUID].selectionAlgorithm
            : state.selectionAlgorithm
    );
    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    return (
        <RadioGroup
            onChange={(event) =>
                setSelectionAlgorithm(
                    event.target.value as SelectionAlgorithm,
                    bindingUUID
                )
            }
            value={selectionAlgorithm}
            style={{ maxWidth: 320, textWrap: 'wrap' }}
        >
            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthZero.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthZero.label',
                })}
                value="depthZero"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthOne.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthOne.label',
                })}
                value="depthOne"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthTwo.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthTwo.label',
                })}
                value="depthTwo"
            />

            <RadioMenuItem
                description={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthUnlimited.description',
                })}
                label={intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.depthUnlimited.label',
                })}
                value="depthUnlimited"
            />
        </RadioGroup>
    );
}
