import { Collapse, Grid, TableCell, TableRow } from '@mui/material';
import { createEditorStore } from 'components/editor/Store';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { LocalZustandProvider } from 'context/LocalZustand';
import { tableBorderSx } from 'context/Theme';
import { EditorStoreNames } from 'context/Zustand';
import { concat } from 'lodash';
import { useMemo } from 'react';
import { ENTITY } from 'types';

interface Props {
    detailsExpanded: boolean;
    lastPubId: string;
    colSpan: number;
    entityType: ENTITY;
    entityName: string;
    collectionNames?: string[];
    disableLogs?: boolean; // TODO (detail logs) We'll start using this again when we have better logs
}

function DetailsPanel({
    detailsExpanded,
    lastPubId,
    colSpan,
    entityType,
    collectionNames,
    entityName,
}: Props) {
    const fullList = useMemo(
        () => concat([entityName], collectionNames),
        [collectionNames, entityName]
    ) as string[];

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
                    <LocalZustandProvider
                        createStore={createEditorStore(
                            EditorStoreNames.GENERAL
                        )}
                    >
                        <Grid container spacing={2}>
                            {entityType !== ENTITY.COLLECTION ? (
                                <ShardInformation entityType={entityType} />
                            ) : null}

                            <EditorAndLogs
                                collectionNames={fullList}
                                lastPubId={lastPubId}
                                disableLogs={true}
                                localZustandScope={true}
                            />
                        </Grid>
                    </LocalZustandProvider>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}

export default DetailsPanel;
