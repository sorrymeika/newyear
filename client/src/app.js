
import './app.css';
import createHome from './pages/home';
import createShow from './pages/show';

function start() {
    const root = document.getElementById('root');

    const activities = {};
    let currenActivity;

    function goToNewActivity(url, createActivity) {
        let newActivity = activities[url || '/'];
        if (!newActivity) {
            newActivity = activities[url || '/'] = createActivity();
            newActivity.$el.appendTo(root);
        }

        if (currenActivity) {
            currenActivity.$el.hide();
        }
        newActivity.$el.show();
        currenActivity = newActivity;
        newActivity.initialize(url);

        return newActivity;
    }

    function matchRoute() {
        const url = location.hash.replace(/^#+/, '');

        if (!url || url === '/') {
            goToNewActivity('/', createHome);
        } else if (/^\/2019\/(\d+)$/.test(url)) {
            goToNewActivity(url, createShow);
        }
    }

    matchRoute();

    window.addEventListener('hashchange', matchRoute);
}

export default {
    start
};