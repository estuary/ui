import { Terminal } from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import DiscoveredSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/DiscoveredSchema';
import ExistingSchemaCommands from 'components/editor/Bindings/SchemaEdit/Commands/ExistingSchema';
import { CollectionData } from 'components/editor/Bindings/types';
import ButtonWithPopper from 'components/shared/ButtonWithPopper';

interface Props {
    collectionData: CollectionData | null | undefined;
}

function SchemaEditButton({ collectionData }: Props) {
    return collectionData ? (
        <ButtonWithPopper
            messageId="workflows.collectionSelector.cta.schemaEdit"
            popper={
                collectionData.belongsToDraft ? (
                    <DiscoveredSchemaCommands />
                ) : (
                    <ExistingSchemaCommands />
                )
            }
            startIcon={<Terminal />}
        />
    ) : (
        <Skeleton variant="rectangular" width={75} />
    );
}

export default SchemaEditButton;
