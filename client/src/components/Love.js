

import LoveModal from './LoveModal';
import { encodeHTML } from '../util';
import LOVE_LIST from '../consts/LOVE_LIST';

export default class Love {
    constructor($el) {
        this.$el = $el;

        this.loves = [];
        this.init();
        this._registerListeners();

        this.loveModal = new LoveModal();
    }

    init() {
        this.loveList = LOVE_LIST;
        this.data = [];

        this.loves = this.loveList.map((data) => {
            const love = this.createLove(data);
            this.$el.append(love.$el);
            this.data.push({
                id: data.id,
            });
            return love;
        });
    }

    set(data) {
        this.data = data.map(item => ({ ...item }));
        this.render();
    }

    _registerListeners() {
        this.$el.on('click', '.J_LoveItem', (e) => {
            const id = Number(e.currentTarget.getAttribute('data-id'));
            const options = this.loveList.find(item => item.id == id);
            const oldData = this.data.find(item => item.id == id);
            this.loveModal.show({
                ...options,
                data: oldData,
                onConfirm: (data) => {
                    const allTags = data.tags.concat(data.moreTags.split(/[,，]/))
                        .filter(tag => !!tag);
                    const loveTags = [...data.loveTags];

                    for (let i = loveTags.length - 1; i >= 0; i--) {
                        if (!allTags.includes(loveTags[i])) {
                            loveTags.splice(i, 1);
                        }
                    }

                    Object.assign(oldData, data, {
                        loveTags
                    });
                    this.render();
                }
            });
        });
    }

    createLove({ id, placeholder }) {
        const $el = $(
            `<div data-id="${id}" class="J_LoveItem app-card flex home_love_item">
                <div class="J_Content app-love-content fx_1">${placeholder}</div>
                <i class="iconfont icon-enter"></i>
            </div>`
        );

        return {
            $el,
            $content: $el.find('.J_Content')
        };
    }

    render() {
        this.loveList.forEach(({ title, subTitle, placeholder }, i) => {
            const love = this.loves[i];
            const data = this.data[i];
            const tags = (data.tags || []).concat((data.moreTags || '').split(/[,，]/)).filter(tag => !!tag);

            love.$content.html(
                tags.length || data.sayLove
                    ? `${tags ? title + ':' + tags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('') : ''}
                        ${data.loveTags && data.loveTags.length ? `<div class="pt_s">${subTitle}:${data.loveTags && data.loveTags.map(tag => `<span>${encodeHTML(tag)}</span>`).join('')}</div>` : ''}
                        ${data.sayLove ? `<code>${encodeHTML(data.sayLove)}</code>` : ''}`
                    : placeholder
            );
        });
    }
}