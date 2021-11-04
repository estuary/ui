import ExploreTable from './../components/table/ExploreTable';
import CardCarousel from './../components/cardCarousel/CardCarousel';
import { CatalogCardContentProps } from './../components/cardCarousel/CatalogCardContent';
import { Container, Toolbar } from '@mui/material';

export default function Explore() {
    const fakeCards: CatalogCardContentProps[] = [
        {
            description:
                'Proin sed turpis nec mauris blandit mattis. Cras eget nisi dictum augue malesuada malesuada. Integer id magna et ipsum cursus vestibulum. Mauris magna. Duis dignissim turpis nec id magna et vestibulum puella.',
            heading: 'elementum purus, accumsan interdum',
            lastUpdate: '05/16/2022',
            user: 'sed.leo.cras@estac.co.uk',
            bandWidth: '1.1 Tb/s',
            schedule: 'Various',
        },
        {
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            heading: 'Excepteur sint occaecat',
            lastUpdate: '10/01/2021',
            user: 'johnny_Goodman_123_admin',
            bandWidth: '100.0 Gb/s',
            schedule: 'Continuous',
        },
        {
            description: 'Ipsum dolor sit amet.',
            heading: 'Excepteur sint occaecat',
            lastUpdate: '01/18/2020',
            user: 'daveMan1592',
            bandWidth: '256.0 MB/s',
            schedule: 'Various',
        },
        {
            description: 'Consectetur adipiscing elit.',
            heading: 'consectetur sint occaecat',
            lastUpdate: '12/01/2031',
            user: 'jiang432',
            bandWidth: '101.0 Kb/s',
            schedule: 'Every 10',
        },
        {
            description:
                'Consectetur adipiscing elit. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
            heading:
                'Consectetur adipiscing elit. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
            lastUpdate: '12/01/2031',
            user: 'jiang432',
            bandWidth: '101.0 Kb/s',
            schedule: 'Every 30',
        },

        {
            description:
                'quam quis diam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce aliquet magna a neque. Nullam ut',
            heading: 'in felis. Nulla tempor augue ac ipsum. Phasellus vitae',
            lastUpdate: '07/18/2021',
            user: 'eu.enim@cursuspurus.com',
            bandWidth: '1.1 Tb/s',
            schedule: 'Every 5',
        },
    ];

    return (
        <Container
            maxWidth={false}
            sx={{
                paddingTop: 2,
            }}
        >
            <Toolbar />
            <CardCarousel cards={fakeCards} />
            <ExploreTable />
        </Container>
    );
}
