import type { RedactSaveButtonProps } from 'src/components/projections/types';
import type { CollectionSchemaProperties } from 'src/types/schemaModels';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { useRedactionAnnotation } from 'src/hooks/projections/useRedactionAnnotation';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

const SaveButton = ({ field, setOpen, strategy }: RedactSaveButtonProps) => {
    const intl = useIntl();

    const { updateRedactionAnnotation } = useRedactionAnnotation();

    const existingSchemaProperties: CollectionSchemaProperties | null =
        useBindingsEditorStore(
            (state) => state.collectionData?.spec.schema?.properties ?? null
        );

    return (
        <Button
            onClick={() => {
                updateRedactionAnnotation(
                    existingSchemaProperties,
                    field,
                    strategy
                ).then(
                    () => {
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
