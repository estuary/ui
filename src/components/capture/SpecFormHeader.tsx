import { AppBar, Toolbar, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';

interface Props {
    name: string;
    docsPath?: string;
}

function NewCaptureSpecFormHeader({ name, docsPath }: Props) {
    if (name) {
        return (
            <AppBar position="relative" elevation={0} color="default">
                <Toolbar
                    variant="dense"
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h5" color="initial">
                        {name}
                    </Typography>

                    {docsPath && docsPath.length > 0 ? (
                        <ExternalLink link={docsPath}>Docs</ExternalLink>
                    ) : null}
                </Toolbar>
            </AppBar>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpecFormHeader;
