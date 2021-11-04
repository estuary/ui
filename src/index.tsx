import ReactDOM from 'react-dom';
import AppRouter from './AppRouter';
import AppTheme from './AppTheme';

ReactDOM.render(
    <AppTheme>
        <AppRouter />
    </AppTheme>,
    document.querySelector('#root')
);
