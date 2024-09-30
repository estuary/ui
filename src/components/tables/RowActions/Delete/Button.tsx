import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';
import { SelectTableStoreNames } from 'stores/names';
import { SettingMetadata } from '../Shared/NestedListItem';

interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}

function DeleteButton({ selectableTableStoreName }: Props) {
    const generator = () => null;

    const isCapture =
        selectableTableStoreName === SelectTableStoreNames.CAPTURE;

    const settings: SettingMetadata[] | undefined = isCapture
        ? [
              {
                  messageId: 'capturesTable.delete.removeCollectionsOption',
                  setting: 'deleteAssociatedCollections',
              },
          ]
        : undefined;

    return (
        <RowActionButton
            confirmationMessage={<DeleteConfirmation />}
            messageID="cta.delete"
            renderProgress={(item, index, onFinish) => (
                <UpdateEntity
                    key={`Item-delete-${index}`}
                    entity={item}
                    onFinish={onFinish}
                    successMessageID="common.deleted"
                    runningMessageID="common.deleting"
                    generateNewSpec={generator}
                    generateNewSpecType={generator}
                    selectableStoreName={selectableTableStoreName}
                />
            )}
            selectableTableStoreName={selectableTableStoreName}
            settings={settings}
        />
    );
}

export default DeleteButton;
