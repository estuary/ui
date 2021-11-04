import CardContent from '@mui/material/CardContent';
import CardActionsArea from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import { CardHeader, Divider, Stack } from '@mui/material';

export type CatalogCardContentProps = {
    description: string;
    heading: string;
    lastUpdate: string;
    user: string;
    bandWidth: string;
    schedule: string;
};

function CatalogCardContent(props: CatalogCardContentProps) {
    const lastUpdatesFormatted = new Intl.DateTimeFormat('en-US').format(
        new Date(props.lastUpdate)
    );

    return (
        <>
            <CardHeader
                title={props.heading}
                titleTypographyProps={{
                    style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 250,
                    },
                }}
                subheader={`Updated: ${lastUpdatesFormatted}`}
                style={{
                    paddingY: 2,
                }}
            />
            <CardContent
                sx={{
                    paddingY: 0,
                    marginY: 1,
                }}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        maxHeight: 70,
                        overflowX: 'auto',
                    }}
                >
                    {props.description}
                </Typography>
            </CardContent>
            <CardActionsArea
                disableSpacing
                sx={{
                    justifyContent: 'center',
                    marginTop: 'auto',
                }}
            >
                <Stack
                    direction="row"
                    divider={<Divider orientation="vertical" flexItem light />}
                    spacing={1}
                >
                    <Typography
                        variant="caption"
                        noWrap
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 120,
                        }}
                    >
                        {props.user}
                    </Typography>
                    <Typography variant="caption" noWrap>
                        {props.bandWidth}
                    </Typography>
                    <Typography variant="caption" noWrap>
                        {props.schedule}
                    </Typography>
                </Stack>
            </CardActionsArea>
        </>
    );
}

export default CatalogCardContent;
