import { Skeleton, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

function CollectionSchemaEditorSkeleton() {
    return (
        <>
            <Stack>
                <Typography variant="subtitle1" component="div">
                    <FormattedMessage id="entityName.label" />
                </Typography>
                <Skeleton width={150} height={50} sx={{ mb: 1, mt: 0 }} />
            </Stack>

            <Typography variant="subtitle1" component="div">
                <FormattedMessage id="schemaEditor.key.label" />
            </Typography>
            <Stack direction="row" spacing={2}>
                <Skeleton
                    variant="rounded"
                    width={50}
                    height={30}
                    sx={{ mb: 1 }}
                />
                <Skeleton
                    variant="rounded"
                    width={50}
                    height={30}
                    sx={{ mb: 1, opacity: 0.5 }}
                />
                <Skeleton
                    variant="rounded"
                    width={50}
                    height={30}
                    sx={{ mb: 1, opacity: 0.25 }}
                />
            </Stack>

            <Stack>
                <Typography variant="subtitle1" component="span">
                    <FormattedMessage id="schemaEditor.fields.label" />
                </Typography>
                <Skeleton variant="rectangular" height={30} sx={{ mb: 1 }} />
                <Skeleton
                    variant="rectangular"
                    height={30}
                    sx={{ mb: 1, opacity: 0.75 }}
                />
                <Skeleton
                    variant="rectangular"
                    height={30}
                    sx={{ mb: 1, opacity: 0.5 }}
                />
                <Skeleton
                    variant="rectangular"
                    height={30}
                    sx={{ mb: 1, opacity: 0.25 }}
                />
            </Stack>
        </>
    );
}

export default CollectionSchemaEditorSkeleton;
