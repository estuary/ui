import { Button } from '@mui/material';
import {
    useBindingsEditorStore_applyInferredSchema,
    useBindingsEditorStore_inferredSchemaApplicationErrored,
    useBindingsEditorStore_inferredSpec,
    useBindingsEditorStore_loadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { CollectionData } from 'components/editor/Bindings/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { isEqual } from 'lodash';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

interface Props {
    collectionData: CollectionData;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function UpdateSchemaButton({ collectionData, setOpen }: Props) {
    // Bindings Editor Store
    const inferredSpec = useBindingsEditorStore_inferredSpec();

    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();

    const inferredSchemaApplicationErrored =
        useBindingsEditorStore_inferredSchemaApplicationErrored();

    const applyInferredSchema = useBindingsEditorStore_applyInferredSchema();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

    const originalSchema = useMemo(() => {
        return Object.hasOwn(collectionData.spec, 'readSchema')
            ? collectionData.spec.readSchema
            : collectionData.spec.schema;
    }, [collectionData.spec]);

    const updateServer = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        applyInferredSchema(currentCollection, persistedDraftId);

        if (!loadingInferredSchema && !inferredSchemaApplicationErrored) {
            setOpen(false);
        }
    };

    return (
        <Button
            disabled={
                !inferredSpec ||
                isEqual(originalSchema, inferredSpec.readSchema) ||
                loadingInferredSchema
            }
            onClick={updateServer}
        >
            <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
        </Button>
    );
}

export default UpdateSchemaButton;
