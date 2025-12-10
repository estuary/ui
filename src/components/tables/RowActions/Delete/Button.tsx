import type { SettingMetadata } from 'src/components/tables/RowActions/Shared/types';
import type { DeleteButtonProps } from 'src/components/tables/RowActions/types';

import DeleteConfirmation from 'src/components/tables/RowActions/Delete/Confirmation';
import RowActionConfirmation from 'src/components/tables/RowActions/Shared/Confirmation';
import GroupedRowActionButton from 'src/components/tables/RowActions/Shared/GroupedButton';
import UpdateEntities from 'src/components/tables/RowActions/Shared/UpdateEntities';
import { SelectTableStoreNames } from 'src/stores/names';

function DeleteButton({ selectableTableStoreName }: DeleteButtonProps) {
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
        <GroupedRowActionButton
            messageIntlKey="cta.delete"
            renderConfirmationMessage={(selectedNames) => {
                return (
                    <RowActionConfirmation
                        selected={selectedNames}
                        message={
                            <DeleteConfirmation count={selectedNames.length} />
                        }
                        selectableTableStoreName={selectableTableStoreName}
                        settings={settings}
                    />
                );
            }}
            renderProgress={(entities, onFinish) => (
                <UpdateEntities
                    entities={entities}
                    onFinish={onFinish}
                    successIntlKey="updateEntity.success.delete"
                    runningIntlKey="updateEntity.running.delete"
                    selectableStoreName={selectableTableStoreName}
                />
            )}
            selectableTableStoreName={selectableTableStoreName}
        />
    );
}

export default DeleteButton;
