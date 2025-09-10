import type { BaseMenuProps } from 'src/components/fieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

import { RadioGroup } from '@mui/material';

import { useIntl } from 'react-intl';

import RadioMenuItem from 'src/components/shared/RadioMenuItem';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuOptions({ fieldsRecommended }: BaseMenuProps) {
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

            {fieldsRecommended === undefined ? null : (
                <RadioMenuItem
                    description={
                        typeof fieldsRecommended === 'number' &&
                        fieldsRecommended > 0
                            ? intl.formatMessage(
                                  {
                                      id: 'fieldSelection.massActionMenu.depthDefault.description',
                                  },
                                  {
                                      depth: fieldsRecommended,
                                  }
                              )
                            : intl.formatMessage({
                                  id:
                                      fieldsRecommended === 0 ||
                                      fieldsRecommended === false
                                          ? 'fieldSelection.massActionMenu.depthZero.description'
                                          : 'fieldSelection.massActionMenu.depthUnlimited.description',
                              })
                    }
                    descriptionTextTransform="none"
                    label={intl.formatMessage({
                        id: 'fieldSelection.massActionMenu.depthDefault.label',
                    })}
                    value="depthDefault"
                />
            )}

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
