import { Box, Card, Paper, Typography } from '@mui/material';
import CatalogCardContent, {
    CatalogCardContentProps,
} from './CatalogCardContent';

type CardCarouselProps = {
    cards: CatalogCardContentProps[];
};

function CardCarousel(props: CardCarouselProps) {
    const { cards } = props;

    return (
        <Paper sx={{ width: '100%', mb: 2, px: 2 }} variant="outlined">
            <Typography variant="h6">Most Popular</Typography>
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    width: '100%',
                    paddingBottom: 1,
                    marginBottom: 2,
                }}
            >
                {cards.map((card: any, index: number) => (
                    <Card
                        key={index}
                        sx={{
                            flexShrink: 0,
                            marginX: 1,

                            display: 'flex',
                            flexDirection: 'column',

                            width: 315,
                        }}
                        variant="outlined"
                    >
                        <CatalogCardContent
                            description={card.description}
                            heading={card.heading}
                            lastUpdate={card.lastUpdate}
                            user={card.user}
                            bandWidth={card.bandWidth}
                            schedule={card.schedule}
                        />
                    </Card>
                ))}
            </Box>
        </Paper>
    );
}

export default CardCarousel;
