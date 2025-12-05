import type { PostgrestError } from '@supabase/postgrest-js';
import type { RedactSaveButtonProps } from 'src/components/projections/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useEditorStore_queryResponse_mutate } from 'src/components/editor/Store/hooks';
import { useRedactionAnnotation } from 'src/hooks/projections/useRedactionAnnotation';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';

const SaveButton = ({
    onClick,
    pointer,
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

    return (
        <Button
            onClick={() => {
                updateRedactionAnnotation(pointer, strategy).then(
                    (response) => {
                        if (mutateDraftSpecs) {
                            mutateDraftSpecs();
                        }

                        if (response?.data?.[0]) {
                            const { catalog_name, spec } = response.data[0];

                            setCollectionData({ spec, belongsToDraft: true });
                            populateSkimProjections(
                                spec,
                                catalog_name,
                                undefined
                            );
                        }

                        logRocketEvent(CustomEvents.COLLECTION_SCHEMA, {
                            operation: 'redact',
                            pointer,
                            strategy,
                        });

                        onClick();
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
                );
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
