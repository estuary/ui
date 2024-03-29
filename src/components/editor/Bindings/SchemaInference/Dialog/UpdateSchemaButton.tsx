import { Button } from '@mui/material';
import {
    useBindingsEditorStore_applyInferredSchema,
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_inferredSchemaApplicationErrored,
    useBindingsEditorStore_inferredSpec,
    useBindingsEditorStore_loadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { isEqual } from 'lodash';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_currentCollection } from 'stores/Binding/hooks';

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function UpdateSchemaButton({ setOpen }: Props) {
    // Binding Store
    const currentCollection = useBinding_currentCollection();

    // Bindings Editor Store
    const inferredSpec = useBindingsEditorStore_inferredSpec();
    const loadingInferredSchema =
        useBindingsEditorStore_loadingInferredSchema();
    const applyInferredSchema = useBindingsEditorStore_applyInferredSchema();
    const collectionData = useBindingsEditorStore_collectionData();
    const inferredSchemaApplicationErrored =
        useBindingsEditorStore_inferredSchemaApplicationErrored();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    const originalSchema = useMemo(() => {
        if (!collectionData?.spec) {
            return {};
        }

        return Object.hasOwn(collectionData.spec, 'readSchema')
            ? collectionData.spec.readSchema
            : collectionData.spec.schema;
    }, [collectionData]);

    const disableUpdate = useMemo(() => {
        return (
            !inferredSpec ||
            loadingInferredSchema ||
            isEqual(originalSchema, inferredSpec.readSchema)
        );
    }, [inferredSpec, loadingInferredSchema, originalSchema]);

    const updateServer = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        applyInferredSchema(currentCollection, persistedDraftId, setOpen);
    };

    if (inferredSchemaApplicationErrored) {
        return null;
    }

    return (
        <Button
            variant="outlined"
            disabled={disableUpdate}
            onClick={updateServer}
        >
            <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
        </Button>
    );
}

export default UpdateSchemaButton;
