import { Autocomplete, Box, TextField } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store';
import { useEntityType } from 'context/EntityContext';
import { slate } from 'context/Theme';
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
    const entityType = useEntityType();
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
        const populateCollectionData =
            entityType === ENTITY.MATERIALIZATION
                ? liveSpecs.length > 0
                : liveSpecs.length > 0 && draftSpecs.length > 0;

        if (populateCollectionData) {
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
                        .filter(
                            ({ spec_type }) => spec_type === ENTITY.COLLECTION
                        )
                        .map(({ catalog_name }) => ({
                            name: catalog_name,
                            classification: 'Discovered Collections',
                        })),
                ];
            }

            setCollectionData(collectionsOnServer);
        }
    }, [
        setCollectionData,
        collections,
        draftSpecs,
        entityType,
        liveSpecs,
        workflow,
    ]);

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

    console.log('collections', collections);
    console.log('collection data', collectionData);
    console.log('live spec error', liveSpecsError);
    console.log('draft spec error', draftSpecsError);

    return collections &&
        collectionData.length > 0 &&
        !liveSpecsError &&
        !draftSpecsError ? (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${slate[200]}`,
            }}
        >
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
                        label={collectionsLabel}
                        required
                        error={missingInput}
                        variant="standard"
                        onBlur={handlers.validateSelection}
                    />
                )}
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
