import './style.css';
import app from './app';

if (typeof String.prototype.padEnd !== 'function' || typeof Object.values !== 'function') {
    import('react-app-polyfill/stable')
        .then(() => {
            app.start();
        });
} else {
    app.start();
}
// import * as serviceWorker from './serviceWorker';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
