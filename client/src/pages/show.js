import show from './show.html';

export default function createHome() {
    const page = document.createElement('div');
    page.innerHTML = show;
    registerListeners(page);
    return page;
}

function registerListeners(page) {
}