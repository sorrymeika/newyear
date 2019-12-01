import show from './show.html';
import { post, encodeHTML } from '../util';

function encodeContent(text) {
    return encodeHTML(text)
        .replace(/\r\n/g, '<br />')
        .replace(/\r|\n/g, '<br />');
}

const DATE_MAP = {
    '2019-01-01': {
        name: '新年第一天',
        placeholder: '和谁在哪里度过的?'
    },
    '2019-02-14': {
        name: '情人节',
        placeholder: '做了些什么?'
    },
    '2019-10-01': {
        name: '国庆假期',
        placeholder: '是怎样度过的?'
    },
    '2019-11-11': {
        name: '双十一',
        placeholder: '是怎样度过的?'
    },
    '2020-01-01': {
        name: '新篇章',
        placeholder: '如何迎接新的一年...'
    },
};

class Show {
    constructor() {
        this.el = document.createElement('div');
        this.el.className = "app-page";
        this.$el = $(this.el);
        this.el.innerHTML = show;

        this._registerListeners();
    }

    initialize(url) {
        if (/^\/2019\/(\d+)$/.test(url)) {
            const uid = Number(RegExp.$1);

            post('/getUserYear', { userId: uid })
                .then((res) => {
                    if (res.data) {
                        const data = JSON.parse(res.data.content);
                        console.log(data);

                        this.$el.find('.J_Summary').html(encodeContent(data.summary));
                        this.initKeywords(data.keywords);
                        this.initLuck(data.luck);

                        const days = data.days.map((day) => this.createDayItem(day)).join('');
                        this.$el.find('.J_Days').html(days);
                    }
                });
        }
    }

    initKeywords({ tags = [], moreTags = '' } = {}) {
        const keywords = tags.concat(moreTags.split(/[,，]/))
            .filter(tag => !!tag)
            .map((tag) => {
                return `<div class="home_keywords_item">${encodeHTML(tag)}</div>`;
            });
        this.$el.find('.J_Keywords').html(keywords.join(''));
    }

    initLuck({ months, content }) {
        const html = months.map((luck, i) => {
            const month = i + 1;
            return `<div class="flex">
                <div class="app-luck-month">${month}月</div>
                <div class="fx_1 flex app-luck-item">
                    <p class="bad">糟透了</p>
                    <div data-luck="${luck}" data-month="${month}" class="bar fx_1">
                        <div class="progress" style="left:${luck}%"></div>
                    </div>
                    <p class="good">完美</p>
                </div>
            </div>`;
        })
            .join('');

        this.$el.find('.J_Luck')
            .html(html);

        this.$el.find('.J_LuckContent')
            .html(encodeContent(content));
    }

    createDayItem({
        date,
        content,
        images,
    }) {
        const year = !date ? '2019' : date.split('-')[0];
        const title = !date ? '选择日期' : (DATE_MAP[date] ? DATE_MAP[date].name : (date.replace(/^\d+-/, '').replace('-', '月') + '日'));
        return (
            `<div class="app-form-item home_day_form_item bd_b" data-date="${date}">
                <div class="J_Title title"><b class="J_Year fs_l">${year}</b>年<em class="J_ShowDate">${title}</em></div>
                <div class="app-day-content">${encodeContent(content)}</div>
                <div class="app-day-images">${images.map((img) => `<img class="app-day-img" src="${process.env.REACT_APP_SFS_URL}${img.src}" />`)}</div>
            </div>`
        );
    }

    _registerListeners() {
        this.$el.on('click', '.J_AlsoMe', () => {
            location.hash = "/";
        });
    }
}

export default function createShow() {
    return new Show();
}