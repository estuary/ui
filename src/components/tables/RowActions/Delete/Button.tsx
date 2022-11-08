import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';
import { SelectTableStoreNames } from 'stores/names';

interface Props {
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.MATERIALIZATION;
}

function DeleteButton({ selectableTableStoreName }: Props) {
    const generator = () => null;

    return (
        <RowActionButton
            confirmationMessage={<DeleteConfirmation />}
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
            messageID="cta.delete"
            selectableTableStoreName={selectableTableStoreName}
        />
    );
}

export default DeleteButton;
