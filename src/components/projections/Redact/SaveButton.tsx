import type { RedactSaveButtonProps } from 'src/components/projections/types';
import type { CollectionSchemaProperties } from 'src/types/schemaModels';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useEditorStore_queryResponse_mutate } from 'src/components/editor/Store/hooks';
import { useRedactionAnnotation } from 'src/hooks/projections/useRedactionAnnotation';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const SaveButton = ({ pointer, setOpen, strategy }: RedactSaveButtonProps) => {
    const intl = useIntl();

    const { updateRedactionAnnotation } = useRedactionAnnotation();

    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const existingSchemaProperties: CollectionSchemaProperties | null =
        useBindingsEditorStore(
            (state) => state.collectionData?.spec.schema?.properties ?? null
        );
    const populateSkimProjections = useBindingsEditorStore(
        (state) => state.populateSkimProjectionResponse
    );
    const setCollectionData = useBindingsEditorStore(
        (state) => state.setCollectionData
    );

    return (
        <Button
            onClick={() => {
                updateRedactionAnnotation(
                    existingSchemaProperties,
                    pointer,
                    strategy
                ).then(
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
                        });

                        setOpen(false);
                    },
                    () => {}
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
