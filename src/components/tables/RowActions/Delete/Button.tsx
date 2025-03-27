import type { SettingMetadata } from 'src/components/tables/RowActions/Shared/types';
import type { DeleteButtonProps } from 'src/components/tables/RowActions/types';

import DeleteConfirmation from 'src/components/tables/RowActions/Delete/Confirmation';
import RowActionButton from 'src/components/tables/RowActions/Shared/Button';
import RowActionConfirmation from 'src/components/tables/RowActions/Shared/Confirmation';
import UpdateEntity from 'src/components/tables/RowActions/Shared/UpdateEntity';
import { SelectTableStoreNames } from 'src/stores/names';

function DeleteButton({ selectableTableStoreName }: DeleteButtonProps) {
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
            messageID="cta.delete"
            renderConfirmationMessage={(selectedNames) => {
                return (
                    <RowActionConfirmation
                        selected={selectedNames}
                        message={<DeleteConfirmation />}
                        selectableTableStoreName={selectableTableStoreName}
                        settings={settings}
                    />
                );
            }}
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
        />
    );
}

export default DeleteButton;
