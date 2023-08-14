import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import { isObject } from 'lodash';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useEndpointConfig_addNewBindings,
    useEndpointConfig_evolveIncompatibleCollections,
    useEndpointConfig_setAddNewBindings,
    useEndpointConfig_setEvolveIncompatibleCollections,
    useEndpointConfig_setServerUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

interface Props {
    readOnly?: boolean;
}

function AutoDiscoverySettings({ readOnly }: Props) {
    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Endpoint Config Store
    const addNewBindings = useEndpointConfig_addNewBindings();
    const setAddNewBindings = useEndpointConfig_setAddNewBindings();

    const evolveIncompatibleCollections =
        useEndpointConfig_evolveIncompatibleCollections();
    const setEvolveIncompatibleCollections =
        useEndpointConfig_setEvolveIncompatibleCollections();

    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Controlling if we need to show the generate button again
    const autoDiscoverySettingsUpdated = useMemo(() => {
        if (draftSpecs.length > 0) {
            if (
                Object.hasOwn(draftSpecs[0].spec, 'autoDiscover') &&
                isObject(draftSpecs[0].spec.autoDiscover)
            ) {
                const autoDiscoverySettings = draftSpecs[0].spec.autoDiscover;

                const newBindingSettingExists = Object.hasOwn(
                    autoDiscoverySettings,
                    'addNewBindings'
                );

                const evolutionSettingExists = Object.hasOwn(
                    autoDiscoverySettings,
                    'evolveIncompatibleCollections'
                );

                if (newBindingSettingExists && !evolutionSettingExists) {
                    return (
                        autoDiscoverySettings.addNewBindings !== addNewBindings
                    );
                } else if (evolutionSettingExists && !newBindingSettingExists) {
                    return (
                        autoDiscoverySettings.evolveIncompatibleCollections !==
                        evolveIncompatibleCollections
                    );
                } else if (newBindingSettingExists && evolutionSettingExists) {
                    return (
                        autoDiscoverySettings.addNewBindings !==
                            addNewBindings ||
                        autoDiscoverySettings.evolveIncompatibleCollections !==
                            evolveIncompatibleCollections
                    );
                }

                return addNewBindings || evolveIncompatibleCollections;
            } else {
                return addNewBindings || evolveIncompatibleCollections;
            }
        } else {
            return false;
        }
    }, [addNewBindings, draftSpecs, evolveIncompatibleCollections]);

    useEffect(() => {
        setServerUpdateRequired(autoDiscoverySettingsUpdated);
    }, [setServerUpdateRequired, autoDiscoverySettingsUpdated]);

    return (
        <Stack sx={{ mt: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 500 }}>
                <FormattedMessage id="workflows.autoDiscovery.header" />
            </Typography>

            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            value={addNewBindings}
                            checked={addNewBindings}
                            disabled={readOnly ?? formActive}
                            onChange={(_event, checked) => {
                                setAddNewBindings(checked);
                            }}
                        />
                    }
                    label={
                        <FormattedMessage id="workflows.autoDiscovery.label.addNewBindings" />
                    }
                />
            </FormControl>

            {addNewBindings ? (
                <FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={evolveIncompatibleCollections}
                                checked={evolveIncompatibleCollections}
                                disabled={readOnly ?? formActive}
                                onChange={(_event, checked) => {
                                    setEvolveIncompatibleCollections(checked);
                                }}
                            />
                        }
                        label={
                            <FormattedMessage id="workflows.autoDiscovery.label.evolveIncompatibleCollection" />
                        }
                        sx={{ ml: 2 }}
                    />
                </FormControl>
            ) : null}
        </Stack>
    );
}

export default AutoDiscoverySettings;
