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
import { useEditorStore_invalidEditors } from 'components/editor/Store/hooks';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import UpdateDraftButton from 'components/transformation/create/Config/UpdateDraftButton';
import SingleStep from 'components/transformation/create/SingleStep';
import StepWrapper from 'components/transformation/create/Wrapper';
import { useLiveSpecs } from 'hooks/useLiveSpecs';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSet } from 'react-use';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';
import { hasLength } from 'utils/misc-utils';

function TransformList() {
    const collections = useLiveSpecs('collection');

    // Draft Editor Store
    const invalidEditors = useEditorStore_invalidEditors();

    // Transformation Create Store
    const transformConfigs = useTransformationCreate_transformConfigs();

    const content: CatalogListContent[] = useMemo(
        () =>
            Object.entries(transformConfigs).map(
                ([attributeId, { name, lambda }]) => ({
                    attributeId,
                    value: name,
                    editorInvalid:
                        !hasLength(lambda) ||
                        invalidEditors.includes(attributeId),
                })
            ),
        [invalidEditors, transformConfigs]
    );

    const [open, setOpen] = useState<boolean>(false);
    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const handlers = {
        toggleDialog: () => {
            selectedCollectionSetFunctions.reset();

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
                    <FormattedMessage id="newTransform.config.transform.addDialog.header" />
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
