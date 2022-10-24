import { Autocomplete, Box, TextField } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store';
import { useEntityWorkflow } from 'context/Workflow';
import useDraftSpecs from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useResourceConfig_collections,
    useResourceConfig_setResourceConfig,
} from 'stores/ResourceConfig';
import { ENTITY } from 'types';
import useConstant from 'use-constant';

interface Props {
    readOnly?: boolean;
}

interface CollectionData {
    name: string;
    classification: string;
}

function CollectionPicker({ readOnly = false }: Props) {
    const workflow = useEntityWorkflow();

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );

    const [collectionData, setCollectionData] = useState<CollectionData[]>([]);
    const [missingInput, setMissingInput] = useState(false);

    const { liveSpecs, error: liveSpecsError } = useLiveSpecs('collection');

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const { draftSpecs, error: draftSpecsError } = useDraftSpecs(draftId);

    useEffect(() => {
        let collectionsOnServer: CollectionData[] = liveSpecs.map(
            ({ catalog_name }) => ({
                name: catalog_name,
                classification: 'Existing Collections',
            })
        );

        if (workflow === 'capture_create') {
            collectionsOnServer = [
                ...collectionsOnServer,
                ...draftSpecs
                    .filter(({ spec_type }) => spec_type === ENTITY.COLLECTION)
                    .map(({ catalog_name }) => ({
                        name: catalog_name,
                        classification: 'Discovered Collections',
                    })),
            ];
        }

        console.log(collectionsOnServer);

        setCollectionData(collectionsOnServer);
    }, [setCollectionData, draftSpecs, liveSpecs, workflow]);

    const handlers = {
        updateCollections: (
            _event: React.SyntheticEvent,
            value: CollectionData[]
        ) => {
            setResourceConfig(value.map(({ name }) => name));
        },
        validateSelection: () => {
            setMissingInput(!collections || collections.length === 0);
        },
    };

    // TODO (design): Determine whether the component should have a label or merely placeholder text.
    //   If a label is desired, the reflex container surrounding the collection selector instance
    //   requires padding to display the label when the field is active. If placeholder text will do,
    //   style overrides are necessary.
    return collections &&
        collectionData.length > 0 &&
        !liveSpecsError &&
        !draftSpecsError ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
                disabled={readOnly}
                multiple
                options={collectionData}
                groupBy={(option) => option.classification}
                getOptionLabel={(option) => option.name}
                value={collections.map(
                    (collectionName) =>
                        collectionData.find(
                            ({ name }) => name === collectionName
                        ) ?? {
                            name: collectionName,
                            classification: 'Existing Collections',
                        }
                )}
                size="small"
                filterSelectedOptions
                fullWidth
                onChange={handlers.updateCollections}
                blurOnSelect={false}
                disableCloseOnSelect
                renderTags={() => {}}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={collectionsLabel}
                        required
                        error={missingInput}
                        onBlur={handlers.validateSelection}
                    />
                )}
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
