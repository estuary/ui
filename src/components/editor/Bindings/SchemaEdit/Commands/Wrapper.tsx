import EditCommandsHeader from 'components/editor/Bindings/SchemaEdit/Commands/Header';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaEdit/Commands/UpdateSchemaButton';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

function EditCommandsWrapper({ children }: Props) {
    return (
        <>
            <EditCommandsHeader />

            {children}

            <UpdateSchemaButton />
        </>
    );
}

export default EditCommandsWrapper;
