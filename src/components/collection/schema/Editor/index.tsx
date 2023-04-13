import ArrayOfPointers from 'components/schema/ArrayOfPointers';
import AlertBox from 'components/shared/AlertBox';
import useCatalogDetails from './useCatalogDetails';

export interface Props {
    disabled?: boolean;
    entityName?: string;
}

function CollectionSchemaEditor({ disabled, entityName }: Props) {
    const { onChange, catalogSpec, catalogType, draftSpec, isValidating } =
        useCatalogDetails(entityName);

    console.log('unused vars', {
        onChange,
        disabled,
        catalogSpec,
        catalogType,
    });

    if (draftSpec) {
        return (
            <form>
                <ArrayOfPointers
                    value={draftSpec.spec.key}
                    spec={draftSpec.spec}
                    onChange={async (event, value, reason) => {
                        console.log('event', { event, value, reason });
                        draftSpec.spec.key = value;
                        await onChange(draftSpec.spec);
                    }}
                />
                <AlertBox title="To Do" severity="error" short>
                    schema: json
                    <br />
                    writeSchema: json
                    <br />
                    readSchema: json
                </AlertBox>
            </form>
        );
    } else if (isValidating) {
        return <>This is the collection schema skeleton</>;
    } else {
        return null;
    }
}

export default CollectionSchemaEditor;
