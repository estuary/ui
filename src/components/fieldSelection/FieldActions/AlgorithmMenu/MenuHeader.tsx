import type { MenuHeaderProps } from 'src/components/fieldSelection/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBinding_currentBindingUUID } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

const MenuHeader = ({ targetFieldsRecommended }: MenuHeaderProps) => {
    const intl = useIntl();

    const bindingUUID = useBinding_currentBindingUUID();
    const recommendFields = useBindingStore((state) => state.recommendFields);

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    const recommended =
        !targetFieldsRecommended &&
        bindingUUID &&
        Object.hasOwn(recommendFields, bindingUUID)
            ? recommendFields[bindingUUID]
            : fieldsRecommended;

    return (
        <Stack style={{ marginBottom: 16 }}>
            <Typography
                style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}
            >
                {intl.formatMessage({
                    id: 'fieldSelection.massActionMenu.header',
                })}
            </Typography>

            {recommended === undefined ? null : (
                <Typography>
                    {typeof recommended === 'number' && recommended > 0
                        ? intl.formatMessage(
                              {
                                  id: 'fieldSelection.massActionMenu.description.numeric',
                              },
                              { depth: recommended }
                          )
                        : intl.formatMessage({
                              id:
                                  recommended === 0 || recommended === false
                                      ? 'fieldSelection.massActionMenu.description.zero'
                                      : 'fieldSelection.massActionMenu.description.unlimited',
                          })}
                </Typography>
            )}
        </Stack>
    );
};

export default MenuHeader;
