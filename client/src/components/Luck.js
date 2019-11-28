export default class Luck {
    constructor(props) {
        this.props = { ...props };
        this.$el = $(
            `<div class="J_Luck pt_m pb_m">
            </div>
            <div class="app-form-item pb_s">
                <textarea class="J_Content app-text" placeholder="忍不住想说..."></textarea>
            </div>`
        );
        this.$luck = this.$('.J_Luck');
        this.$content = this.$el.find('.J_Content');
        this.months = [];
        this.init();
    }

    $(selector) {
        return this.$el.filter(selector)
            .add(this.$el.find(selector));
    }

    get data() {
        return {
            content: this.$content.val(),
            months: this.months.map(month => month.data)
        };
    }

    set({ content, months }) {
        this.$content.val(content);
        if (months.length !== 12) {
            throw new Error('运势数据有误!');
        }
        months.forEach((luck, i) => {
            this.months[i].setLuck(luck);
        });
    }

    init() {
        for (let i = 1; i <= 12; i++) {
            const month = this.createItem({
                month: i,
                luck: 50
            });
            this.months.push(month);
            this.$luck.append(month.$el);
        }

        this.$luck.on('touchstart', '.bar', (e) => {
            const startX = e.touches[0].pageX;
            const startY = e.touches[0].pageY;
            const bar = e.currentTarget;
            const startLuck = Number(bar.getAttribute('data-luck'));
            let isStart = false;
            let isStop = false;

            const progress = bar.querySelector('.progress');
            const length = bar.offsetWidth;

            const touchMove = (e) => {
                if (isStop) return;

                const x = e.touches[0].pageX;
                const y = e.touches[0].pageY;

                if (!isStart) {
                    if (Math.abs(x - startX) < Math.abs(y - startY)) {
                        isStop = true;
                        return;
                    }
                    isStart = true;
                }

                const changed = ((x - startX) / length) * 100;
                const result = Math.min(Math.max(startLuck + changed, 0), 100);

                progress.style.left = result + '%';
                bar.setAttribute('data-luck', result + '');
            };
            const touchEnd = (e) => {
                isStop = true;
                document.body.removeEventListener('touchmove', touchMove);
                document.body.removeEventListener('touchend', touchMove, true);
            };
            document.body.addEventListener('touchmove', touchMove);
            document.body.addEventListener('touchend', touchEnd, true);
        });
    }

    createItem({
        month,
        luck
    }) {
        const $el = $(
            `<div class="flex">
                <div class="app-luck-month">${month}月</div>
                <div class="fx_1 flex app-luck-item">
                    <p class="bad">糟透了</p>
                    <div data-luck="${luck}" data-month="${month}" class="bar fx_1">
                        <div class="progress" style="left:${luck}%"></div>
                    </div>
                    <p class="good">完美</p>
                </div>
            </div>`
        );

        return {
            $el,
            get data() {
                return Math.round(Number($el.find('.bar').attr('data-luck')));
            },
            setLuck(val) {
                $el.find('.bar').attr('data-luck', val);
                $el.find('.progress').css({
                    left: val + '%'
                });
            }
        };
    }

    destroy() {
        this.$luck.off();
        this.$el.off()
            .remove();
    }
}