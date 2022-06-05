import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import { createEditorStore } from 'components/editor/Store';
import { ZustandProvider } from 'hooks/useZustand';
import { ENTITY } from 'types';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { tableBorderSx } from 'context/Theme';
// import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';

interface Props {
    detailsExpanded: boolean;
    id: string;
    storeName?: string;
    colSpan: number;
    disableLogs?: boolean;
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function DetailsPanel({
    detailsExpanded,
    id,
    storeName = 'liveSpecEditor',
    colSpan,
    disableLogs,
    entityType,
}: Props) {
    // const specs = useZustandStore<
    //     EditorStoreState<PublicationSpecQuery>,
    //     EditorStoreState<PublicationSpecQuery>['specs']
    // >((state) => state.specs);

    return (
        <TableRow>
            <TableCell
                sx={
                    detailsExpanded
                        ? tableBorderSx
                        : { pb: 0, pt: 0, ...tableBorderSx }
                }
                colSpan={colSpan}
            >
                <Collapse in={detailsExpanded} unmountOnExit>
                    <ZustandProvider
                        createStore={createEditorStore}
                        storeName={storeName}
                    >
                        <Grid container spacing={2}>
                            {entityType && (
                                <ShardInformation entityType={entityType} />
                            )}

                            <EditorAndLogs
                                lastPubId={id}
                                disableLogs={disableLogs}
                            />
                        </Grid>
                    </ZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
