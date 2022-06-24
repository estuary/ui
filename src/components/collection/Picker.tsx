import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';
import useConstant from 'use-constant';

function CollectionPicker() {
    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );
    const [missingInput, setMissingInput] = useState(false);

    const { liveSpecs: collectionData, error } = useLiveSpecs('collection');

    const useEntityCreateStore = useRouteStore();
    const collections: string[] = useEntityCreateStore(
        entityCreateStoreSelectors.collections.get
    );
    const setResourceConfig = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.set
    );

    const handlers = {
        updateCollections: (event: React.SyntheticEvent, value: any) => {
            setResourceConfig(value);
        },
        validateSelection: () => {
            setMissingInput(collections.length === 0);
        },
    };

    return collectionData.length > 0 && !error ? (
        <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage id="materializationCreate.collectionSelector.heading" />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.collectionSelector.instructions" />
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                    multiple
                    options={collectionData.map(
                        ({ catalog_name }) => catalog_name
                    )}
                    value={collections}
                    size="small"
                    filterSelectedOptions
                    fullWidth
                    onChange={handlers.updateCollections}
                    blurOnSelect={false}
                    disableCloseOnSelect
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={collectionsLabel}
                            required
                            error={missingInput}
                            onBlur={handlers.validateSelection}
                        />
                    )}
                />
            </Box>
        </Box>
    ) : null;
}

export default CollectionPicker;
