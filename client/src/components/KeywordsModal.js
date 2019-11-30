export default class KeywordsModal {
    constructor() {
        this.props = {};

        this.$el = $(
            `<div class="app-keywords-modal" style="display:none">
                <div class="app-keywords-modal-con">
                    <div class="app-keywords-modal-scroll ofy_s">
                        <div class="J_All">
                            <h3 class="app-keywords-modal-title">2019关键字</h3>
                            <ul class="J_Tags tags clearfix">
                            </ul>
                            <textarea class="J_MoreTags app-text" placeholder="更多,多项用','号隔开..."></textarea>
                        </div>
                    </div>
                    <div class="app-keywords-modal-footer">
                        <button class="J_HideModal btn_cancel">取消</button>
                        <button class="J_Confirm btn_confirm">确定</button>
                    </div>
                </div>
            </div>`
        );
        this.$tags = this.$el.find('.J_Tags');
        this.$moreTags = this.$el.find('.J_MoreTags');

        this.$el.appendTo(document.body);

        const $moreTags = this.$moreTags;
        Object.defineProperty(this, 'data', {
            value: {
                tags: [],
                get moreTags() {
                    return $moreTags.val();
                },
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
            .on('click', '.J_HideModal', () => {
                this.hide();
            })
            .on('click', '.J_Confirm', async () => {
                this.props.onConfirm && await this.props.onConfirm(this.data);
                this.hide();
            });
    }

    set({ tags, loveTags, moreTags, sayLove } = {}) {
        this.$moreTags.val(moreTags || '');
        this.setTags(tags);
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
    }

    show({
        tags,
        data,
        onConfirm
    }) {
        this.props.onConfirm = onConfirm;

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