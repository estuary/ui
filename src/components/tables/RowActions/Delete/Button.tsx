import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';
import { ReactNode } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import Settings from './Settings';

interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.COLLECTION_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}

function DeleteButton({ selectableTableStoreName }: Props) {
    const nestedItem: ReactNode | undefined =
        selectableTableStoreName === SelectTableStoreNames.CAPTURE ? (
            <Settings />
        ) : undefined;

    const generator = () => null;

    return (
        <RowActionButton
            confirmationMessage={<DeleteConfirmation />}
            messageID="cta.delete"
            nestedItem={nestedItem}
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
