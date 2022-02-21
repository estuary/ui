import { Container, Toolbar } from '@mui/material';
import SortableTable from '../components/table/SortableTable';

const Collections: React.FC = () => {
    return (
        <Container
            sx={{
                pt: 2,
            }}
        >
            <Toolbar />
            <SortableTable rows={[]} headers={[]} />
        </Container>
    );
};

export default Collections;
