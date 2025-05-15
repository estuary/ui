import type { AliasListProps } from 'src/components/tables/cells/types';

import { Box, Chip, Stack, TableCell } from '@mui/material';

// import { useBinding_currentCollection } from 'src/stores/Binding/hooks';
// import { useWorkflowStore } from 'src/stores/Workflow/Store';
import EditProjectionButton from 'src/components/projections/Edit/Button';
import { ProjectionDefinitions } from 'src/components/projections/Edit/ProjectionDefinitions';
import { defaultOutline } from 'src/context/Theme';
import { useProjectedFields } from 'src/hooks/projections/useProjectedFields';

export const FieldList = ({ field, pointer }: AliasListProps) => {
    // const currentCollection = useBinding_currentCollection();

    // const projectedFields = useWorkflowStore((state) =>
    //     pointer && currentCollection && state.projections?.[currentCollection]
    //         ? Object.entries(state.projections[currentCollection])
    //               .filter(([location, _metadata]) => location === pointer)
    //               .flatMap(([_location, metadata]) => metadata)
    //         : []
    // );

    const { collection, projectedFields } = useProjectedFields(pointer);

    return (
        <TableCell>
            <Stack spacing={1}>
                <Box style={{ alignItems: 'center', display: 'inline-flex' }}>
                    <EditProjectionButton field={field} pointer={pointer} />
                </Box>

                <ProjectionDefinitions
                    collection={collection}
                    projectedFields={projectedFields}
                />

                <Box style={{ alignItems: 'center', display: 'inline-flex' }}>
                    <Chip
                        component="span"
                        label={field}
                        size="small"
                        sx={{
                            'border': (theme) =>
                                defaultOutline[theme.palette.mode],
                            '&:hover': {
                                background: (theme) =>
                                    theme.palette.background.default,
                            },
                            '&:hover::after': {
                                background: (theme) =>
                                    theme.palette.background.default,
                            },
                            '& .MuiChip-deleteIconSmall': {
                                'mr': '1px',
                                '&:hover': {
                                    color: (theme) => theme.palette.error.main,
                                },
                            },
                        }}
                        variant="outlined"
                    />
                </Box>
            </Stack>
        </TableCell>
    );
};
