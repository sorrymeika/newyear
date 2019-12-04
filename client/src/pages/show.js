import show from './show.html';
import { post, encodeHTML, completeSfsUrl } from '../util';
import LOVE_LIST from '../consts/LOVE_LIST';

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
                        this.setNickName(res.data.nickName);

                        // 结语
                        this.$el.find('.J_Summary').html(encodeContent(data.summary));

                        // 关键字
                        this.initKeywords(data.keywords);

                        // 最爱
                        this.initLove(data.love);
                        this.$el.find('.J_LoveMore').html(encodeContent(data.loveMore));
                        this.$el.find('.J_LoveMore').css({
                            display: data.loveMore ? 'block' : 'none'
                        });

                        // 记事
                        const days = data.days.map((day) => this.createDayItem(day)).join('');
                        this.$el.find('.J_Days').html(days);

                        // 健康
                        const { healthExamination, sports, hospital } = data.health;
                        this.$el.find('.J_Hospital').html(hospital);
                        this.$el.find('.J_Sports').html(sports);
                        this.$el.find('.J_HealthExamination').html(healthExamination);

                        this.$el.find('.J_HealthText').html(encodeContent(data.health.content));

                        // 运势
                        this.initLuck(data.luck);
                    }
                });
        }
    }

    setNickName(nickName) {
        this.$el.find('.J_NickName').html(nickName);
        document.title = nickName + '的2019年终总结';
    }

    initLove(love) {
        const html = LOVE_LIST.map(({ title, subTitle }, i) => {
            const data = love[i] || {};
            const tags = (data.tags || []).concat((data.moreTags || '').split(/[,，]/)).filter(tag => !!tag);

            const content = tags.length || data.sayLove
                ? `${tags ? title + ':' + tags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('') : ''}
                ${data.loveTags && data.loveTags.length ? `<div class="pt_s">${subTitle}:${data.loveTags && data.loveTags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('')}</div>` : ''}
                ${data.sayLove ? `<code>${encodeHTML(data.sayLove)}</code>` : ''}`
                : null;

            return content
                ? (
                    `<div class="J_LoveItem app-card flex home_love_item">
                        <div class="J_Content app-love-content fx_1">${content}</div>
                    </div>`
                )
                : null;
        })
            .filter(item => !!item)
            .join('');

        this.$el.find('.J_Love').html(html);
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
            `<div class="app-form-item home_day_form_item" data-date="${date}">
                <div class="J_Title title"><b class="J_Year fs_l">${year}</b>年<em class="J_ShowDate">${title}</em></div>
                <div class="app-day-content">${encodeContent(content)}</div>
                <div class="app-day-images">${images.map((img) => `<img class="app-day-img" src="${completeSfsUrl(img.src)}" />`).join('')}</div>
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