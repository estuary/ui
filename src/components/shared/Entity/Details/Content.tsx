import { Box, Divider, Stack, Typography } from '@mui/material';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import RenderTab from 'components/shared/Entity/Details/RenderTab';
import DetailTabs from 'components/shared/Entity/Details/Tabs';
import { truncateTextSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { specContainsDerivation } from 'utils/misc-utils';

function DetailContent() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    return (
        <Box>
            <Stack spacing={2} sx={{ m: 1 }}>
                <Stack direction="row" spacing={1}>
                    <Typography
                        component="span"
                        variant="h6"
                        sx={{
                            ...truncateTextSx,
                            alignItems: 'center',
                        }}
                    >
                        {catalogName}
                    </Typography>
                    {/*TODO (details) need to wire in edit button*/}
                    {/*<EditButton />*/}
                </Stack>
                <Divider />
                <DetailTabs isDerivation={isDerivation} />
            </Stack>

            <Box sx={{ m: 1 }}>
                <RenderTab isDerivation={isDerivation} />
            </Box>
        </Box>
    );
}

export default DetailContent;
