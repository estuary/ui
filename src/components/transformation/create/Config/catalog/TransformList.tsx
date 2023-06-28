import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
} from '@mui/material';
import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import CollectionSelector from 'components/collection/Selector';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import UpdateDraftButton from 'components/transformation/create/Config/UpdateDraftButton';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSet } from 'react-use';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';

function TransformList() {
    const collections = useLiveSpecs('collection');

    const transformConfigs = useTransformationCreate_transformConfigs();

    const content: CatalogListContent[] = useMemo(
        () =>
            Object.entries(transformConfigs).map(
                ([attributeId, { filename }]) => ({
                    attributeId,
                    value: filename,
                })
            ),
        [transformConfigs]
    );

    const [open, setOpen] = useState<boolean>(false);
    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const handlers = {
        toggleDialog: () => {
            setOpen(!open);
        },
    };

    return (
        <>
            <CatalogList
                fixedAttributeType="transform"
                content={content}
                addButtonClickHandler={handlers.toggleDialog}
                height={532}
            />

            <Dialog open={open} fullWidth maxWidth="md">
                <DialogTitle>
                    <FormattedMessage id="newTransform.editor.catalog.transform.addDialog.header" />
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 2 }}>
                        <StepWrapper>
                            <SingleStep>
                                <FormattedMessage id="newTransform.baseConfig.sourceCollections.label" />
                            </SingleStep>

                            <Divider />

                            <CollectionSelector
                                height={350}
                                loading={collections.isValidating}
                                skeleton={<BindingsSelectorSkeleton />}
                                removeAllCollections={
                                    selectedCollectionSetFunctions.reset
                                }
                                collections={selectedCollectionSet}
                                removeCollection={
                                    selectedCollectionSetFunctions.remove
                                }
                                addCollection={
                                    selectedCollectionSetFunctions.add
                                }
                            />
                        </StepWrapper>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={handlers.toggleDialog}>
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <UpdateDraftButton
                        selectedCollections={selectedCollectionSet}
                        setDialogOpen={setOpen}
                    />
                </DialogActions>
            </Dialog>
        </>
    );
}

export default TransformList;
