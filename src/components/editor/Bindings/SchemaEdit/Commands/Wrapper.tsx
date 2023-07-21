import { ReactNode } from 'react';

import EditCommandsHeader from 'components/editor/Bindings/SchemaEdit/Commands/Header';
import UpdateSchemaButton from 'components/editor/Bindings/SchemaEdit/Commands/UpdateSchemaButton';

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
