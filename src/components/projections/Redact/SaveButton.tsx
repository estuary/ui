import type { PostgrestError } from '@supabase/postgrest-js';
import type { RedactSaveButtonProps } from 'src/components/projections/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useEditorStore_queryResponse_mutate } from 'src/components/editor/Store/hooks';
import { useRedactionAnnotation } from 'src/hooks/projections/useRedactionAnnotation';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

// It should be noted that /_meta/flow_truncated and /_meta/uuid are synthetic locations.
// Redaction annotations defined for these locations result in, effectively, a noop
// on the backend.
const SaveButton = ({
    closeDialog,
    pointer,
    previousStrategy,
    setError,
    strategy,
}: RedactSaveButtonProps) => {
    const intl = useIntl();

    const { updateRedactionAnnotation } = useRedactionAnnotation();

    const mutateDraftSpecs = useEditorStore_queryResponse_mutate({
        localScope: true,
    });

    const populateSkimProjections = useBindingsEditorStore(
        (state) => state.populateSkimProjectionResponse
    );
    const setCollectionData = useBindingsEditorStore(
        (state) => state.setCollectionData
    );

    const formActive = useFormStateStore_isActive();

    const [saving, setSaving] = useState(false);

    return (
        <Button
            disabled={formActive || saving}
            onClick={() => {
                if (previousStrategy === strategy) {
                    logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                        operation: 'redact',
                        pointer,
                        previousStrategy,
                        strategy,
                    });

                    closeDialog();
                    return;
                }

                setSaving(true);

                updateRedactionAnnotation(pointer, strategy)
                    .then(
                        (response) => {
                            const dataExists = Boolean(response?.data?.[0]);

                            logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                                operation: 'redact',
                                pointer,
                                strategy,
                                dataExists,
                            });

                            if (mutateDraftSpecs) {
                                mutateDraftSpecs();
                            }

                            if (dataExists) {
                                const { catalog_name, spec } = response.data[0];

                                setCollectionData({
                                    spec,
                                    belongsToDraft: true,
                                });
                                populateSkimProjections(
                                    spec,
                                    catalog_name,
                                    undefined
                                );
                            }

                            closeDialog();
                        },
                        (error) => {
                            const formattedError: PostgrestError =
                                typeof error === 'object'
                                    ? error
                                    : {
                                          ...BASE_ERROR,
                                          message:
                                              typeof error === 'string'
                                                  ? error
                                                  : intl.formatMessage({
                                                        id: 'projection.error.alert.redactDefaultError',
                                                    }),
                                      };

                            setError(formattedError);
                        }
                    )
                    .finally(() => {
                        setSaving(false);
                    });
            }}
            variant="outlined"
        >
            {intl.formatMessage({
                id: 'cta.evolve',
            })}
        </Button>
    );
};

export default SaveButton;
