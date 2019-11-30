

import LoveModal from './LoveModal';
import { encodeHTML } from '../util';

export default class Love {
    constructor($el) {
        this.$el = $el;

        this.loves = [];
        this.init();
        this._registerListeners();

        this.loveModal = new LoveModal();
    }

    init() {
        this.loveList = [{
            id: 1,
            placeholder: '看了哪些电影？其中最爱？',
            title: '2019年看过的电影',
            subTitle: '最爱的电影',
            tags: ['流浪地球', "白蛇：缘起", '爱，死亡和机器人', '哪吒之魔童降世', '罗小黑战记', '我和我的祖国', '寄生虫', '少年的你', '天气之子', '海上钢琴师', '玩具总动员4', '冰雪奇缘2', '复仇者联盟4', '蜘蛛侠：英雄远征'],
        }, {
            id: 4,
            placeholder: '看了哪些电视剧？其中最爱？',
            tags: ['长安十二时辰', '小欢喜', '陈情令', '亲爱的，热爱的', '庆余年', '轮到你了', '孤独的美食家', '致命女人', '唐顿庄园', '性爱自修室', '权力的游戏 第八季']
        }, {
            id: 2,
            placeholder: '读了哪些书？其中最爱？',
            title: '2019年看过的书',
            subTitle: '最爱的书',
            tags: ['蛙', '有匪', '历史的温度', '白夜行']
        }, {
            id: 3,
            placeholder: '看了哪些综艺节目？其中最爱？',
            tags: ['奇葩说', '这！就是街舞', '乐队的夏天', '脱口秀大会', '奇遇人生']
        }, {
            id: 6,
            placeholder: '看了哪些动画？其中最爱？',
            title: '2019年看过的动画',
            subTitle: '最爱的动画',
            tags: ['瑞克和莫蒂', '进击的巨人', '多罗罗', '鬼灭之刃', '动物狂想曲', '灵能百分百 II', '一拳超人 第二季', '魔道师祖', '心理测量者', '泰迦奥特曼', 'pop子和pipi美的日常']
        }, {
            id: 5,
            placeholder: '去了哪些地方？',
            title: '2019年去过哪些地方',
            subTitle: '最爱的地方',
            tags: ['上海', '北京', '青岛', '大连', '香格里拉']
        }];

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