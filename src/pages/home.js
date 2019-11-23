import home from './home.html';

export default function createHome() {
    const page = document.createElement('div');
    page.innerHTML = home;
    registerListeners(page);
    return page;
}

function registerListeners(page) {
}