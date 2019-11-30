import { encodeHTML } from '../util';

export default class LoveModal {
    constructor() {
        this.props = {};

        this.$el = $(
            `<div class="app-love-modal" style="display:none">
                <div class="app-love-modal-con">
                    <div class="app-love-modal-scroll ofy_s">
                        <div class="J_All">
                            <h3 class="J_Title app-love-modal-title">2019年看过的电影</h3>
                            <ul class="J_Tags tags clearfix">
                            </ul>
                            <textarea class="J_MoreTags app-text" placeholder="更多,多项用','号隔开..."></textarea>
                        </div>
                        <h3 class="J_SubTitle pt_m app-love-modal-title">最爱的电影</h3>
                        <ul class="J_LoveTags tags clearfix">
                        </ul>
                        <textarea class="J_SayLove app-text" placeholder="不得不说..."></textarea>
                    </div>
                    <div class="app-love-modal-footer">
                        <button class="J_HideLoveModal btn_cancel">取消</button>
                        <button class="J_ConfirmLove btn_confirm">确定</button>
                    </div>
                </div>
            </div>`
        );
        this.$all = this.$el.find('.J_All');
        this.$tags = this.$el.find('.J_Tags');
        this.$moreTags = this.$el.find('.J_MoreTags');
        this.$loveTags = this.$el.find('.J_LoveTags');
        this.$sayLove = this.$el.find('.J_SayLove');

        this.$title = this.$el.find('.J_Title');
        this.$subTitle = this.$el.find('.J_SubTitle');
        this.$el.appendTo(document.body);

        const $moreTags = this.$moreTags;
        const $sayLove = this.$sayLove;
        Object.defineProperty(this, 'data', {
            value: {
                tags: [],
                loveTags: [],
                get moreTags() {
                    return $moreTags.val();
                },
                get sayLove() {
                    return $sayLove.val();
                }
            },
            writable: false
        });

        this._registerListeners();
    }

    _registerListeners() {
        this.$el
            .on('click', '.J_Tags li', (e) => {
                const tagName = e.currentTarget.innerHTML;
                const { tags = [] } = this.data;
                const index = tags.indexOf(tagName);
                if (e.currentTarget.classList.contains('curr')) {
                    if (index != -1) {
                        tags.splice(index, 1);
                    }
                } else {
                    if (index == -1) {
                        tags.push(tagName);
                    }
                }
                this.setTags(tags);
            })
            .on('click', '.J_LoveTags li', (e) => {
                const tagName = e.currentTarget.innerHTML;
                const { loveTags = [] } = this.data;
                const index = loveTags.indexOf(tagName);
                if (e.currentTarget.classList.contains('curr')) {
                    if (index != -1) {
                        loveTags.splice(index, 1);
                    }
                } else {
                    if (index == -1) {
                        loveTags.push(tagName);
                    }
                }
                this.setLoveTags(loveTags);
            })
            .on('click', '.J_HideLoveModal', () => {
                this.hide();
            })
            .on('input', '.J_MoreTags', () => {
                this.syncAllLoveTags();
            })
            .on('click', '.J_ConfirmLove', async () => {
                this.props.onConfirm && await this.props.onConfirm(this.data);
                this.hide();
            });
    }

    set({ tags, loveTags, moreTags, sayLove } = {}) {
        this.$moreTags.val(moreTags || '');
        this.$sayLove.val(sayLove || '');
        this.setTags(tags);
        this.setLoveTags(loveTags);
    }

    setTags(val) {
        this.data.tags = val || [];

        const { tags } = this.data;
        this.$tags.find('li').each((i, el) => {
            if (tags.find(tag => tag == el.innerHTML)) {
                $(el).addClass('curr');
            } else {
                $(el).removeClass('curr');
            }
        });
        this.syncAllLoveTags();
    }

    setLoveTags(val) {
        this.data.loveTags = val || [];
        this.syncLoveTags();
    }

    syncAllLoveTags() {
        const loveTagsHtml = this.data.tags.concat(this.data.moreTags.split(/[,，]/))
            .filter(tag => !!tag)
            .map((tag) => {
                return `<li>${encodeHTML(tag)}</li>`;
            })
            .join('');
        this.$loveTags.html(loveTagsHtml);
        this.syncLoveTags();
    }

    syncLoveTags() {
        const { loveTags } = this.data;
        this.$loveTags.find('li').each((i, el) => {
            if (loveTags.find(tag => tag == el.innerHTML)) {
                $(el).addClass('curr');
            } else {
                $(el).removeClass('curr');
            }
        });
    }

    show({
        title,
        subTitle,
        tags,
        data,
        onConfirm
    }) {
        this.props.onConfirm = onConfirm;
        this.$title.html(title);
        this.$subTitle.html(subTitle);

        const tagsHtml = tags.map((tag) => {
            return `<li>${tag}</li>`;
        }).join('');
        this.$tags.html(tagsHtml);

        this.set({ ...data });

        this.$el.show();
    }

    hide() {
        this.$el.hide();
    }
}