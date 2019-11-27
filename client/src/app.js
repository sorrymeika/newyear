
import './app.css';
import createHome from './pages/home';

function start() {
    const root = document.getElementById('root');
    const home = createHome();
    root.appendChild(home.el);
}

export default {
    start
};