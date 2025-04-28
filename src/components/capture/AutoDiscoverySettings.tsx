import { useEffect, useMemo } from 'react';

import {
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';

import { isEqual, isObject } from 'lodash';
import { FormattedMessage } from 'react-intl';

import useAutoDiscovery from 'src/components/capture/useAutoDiscovery';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import {
    useSchemaEvolution_addNewBindings,
    useSchemaEvolution_autoDiscover,
    useSchemaEvolution_evolveIncompatibleCollections,
    useSchemaEvolution_setAddNewBindings,
    useSchemaEvolution_setAutoDiscover,
    useSchemaEvolution_setEvolveIncompatibleCollections,
    useSchemaEvolution_setSettingsSaving,
    useSchemaEvolution_settingsSaving,
} from 'src/stores/SchemaEvolution/hooks';

interface Props {
    readOnly?: boolean;
}

function AutoDiscoverySettings({ readOnly }: Props) {
    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    // Schema Evolution Store
    const autoDiscover = useSchemaEvolution_autoDiscover();
    const setAutoDiscover = useSchemaEvolution_setAutoDiscover();

    const addNewBindings = useSchemaEvolution_addNewBindings();
    const setAddNewBindings = useSchemaEvolution_setAddNewBindings();

    const evolveIncompatibleCollections =
        useSchemaEvolution_evolveIncompatibleCollections();
    const setEvolveIncompatibleCollections =
        useSchemaEvolution_setEvolveIncompatibleCollections();

    const settingsSaving = useSchemaEvolution_settingsSaving();
    const setSettingsSaving = useSchemaEvolution_setSettingsSaving();

    const updateAutoDiscoverySettings = useAutoDiscovery();

    const settingsExist = useMemo(
        () =>
            draftSpecs.length > 0 && isObject(draftSpecs[0].spec.autoDiscover),
        [draftSpecs]
    );

    useEffect(() => {
        setAutoDiscover(settingsExist, { initOnly: true });

        if (settingsExist) {
            const autoDiscoverySettings = draftSpecs[0].spec.autoDiscover;

            setAddNewBindings(Boolean(autoDiscoverySettings?.addNewBindings), {
                initOnly: true,
            });

            setEvolveIncompatibleCollections(
                Boolean(autoDiscoverySettings?.evolveIncompatibleCollections),
                {
                    initOnly: true,
                }
            );
        } else {
            setAddNewBindings(false, { initOnly: true });
            setEvolveIncompatibleCollections(false, { initOnly: true });
        }
    }, [
        setAddNewBindings,
        setAutoDiscover,
        setEvolveIncompatibleCollections,
        draftSpecs,
        settingsExist,
    ]);

    const serverUpdateRequired = useMemo(() => {
        const settingsNew =
            !settingsExist &&
            (autoDiscover || addNewBindings || evolveIncompatibleCollections);

        const settingsChanged =
            settingsExist &&
            (!autoDiscover ||
                !isEqual(draftSpecs[0].spec.autoDiscover, {
                    addNewBindings,
                    evolveIncompatibleCollections,
                }));

        return settingsNew || settingsChanged;
    }, [
        addNewBindings,
        autoDiscover,
        draftSpecs,
        evolveIncompatibleCollections,
        settingsExist,
    ]);

    useEffect(() => {
        if (settingsSaving) {
            if (serverUpdateRequired) {
                setFormState({ status: FormStatus.UPDATING });

                updateAutoDiscoverySettings()
                    .then(
                        () => setFormState({ status: FormStatus.UPDATED }),
                        (error) =>
                            setFormState({
                                status: FormStatus.FAILED,
                                error: {
                                    title: 'workflows.autoDiscovery.update.failed',
                                    error,
                                },
                            })
                    )
                    .finally(() => setSettingsSaving(false));
            } else {
                setSettingsSaving(false);
            }
        }
    }, [
        setFormState,
        setSettingsSaving,
        updateAutoDiscoverySettings,
        serverUpdateRequired,
        settingsSaving,
    ]);

    return (
        <Stack spacing={1}>
            <Typography variant="formSectionHeader">
                <FormattedMessage id="workflows.autoDiscovery.header" />
            </Typography>

            <Stack spacing={2} direction="row">
                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={autoDiscover}
                                checked={autoDiscover}
                                disabled={readOnly ?? formActive}
                                onChange={(event, checked) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    setAutoDiscover(checked);
                                }}
                            />
                        }
                        label={
                            <FormattedMessage id="workflows.autoDiscovery.label.optIntoDiscovery" />
                        }
                    />
                </FormControl>

                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={addNewBindings}
                                checked={addNewBindings}
                                disabled={readOnly ?? formActive}
                                onChange={(event, checked) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    setAddNewBindings(checked);
                                }}
                            />
                        }
                        label={
                            <FormattedMessage id="workflows.autoDiscovery.label.addNewBindings" />
                        }
                    />
                </FormControl>

                <FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                size="small"
                                value={evolveIncompatibleCollections}
                                checked={evolveIncompatibleCollections}
                                disabled={readOnly ?? formActive}
                                onChange={(event, checked) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    setEvolveIncompatibleCollections(checked);
                                }}
                            />
                        }
                        label={
                            <FormattedMessage id="workflows.autoDiscovery.label.evolveIncompatibleCollection" />
                        }
                    />
                </FormControl>
            </Stack>
        </Stack>
    );
}

export default AutoDiscoverySettings;
