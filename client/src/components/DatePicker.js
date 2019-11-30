import date from './DatePicker.html';
import { pad } from '../util';

export default class DatePicker {
    constructor(props) {
        this.props = props || {};
        this.$el = $(date);
        this.$months = this.$el.find('.J_Months');
        this.$container = this.$el.find('.J_DateContainer');
        this.init();
    }

    init() {
        const days = [
            [[30, 31], [1, 31], [1, 9]],
            [[27, 31], [1, 28], [1, 9]],
            [[24, 28], [1, 31], [1, 6]],
            [[31, 31], [1, 30], [1, 11]],
            [[28, 30], [1, 31], [1, 8]],
            [[26, 31], [1, 30], [1, 6]],
            [[30, 30], [1, 31], [1, 10]],
            [[28, 31], [1, 31], [1, 7]],
            [[0, -1], [1, 30], [1, 12]],
            [[29, 30], [1, 31], [1, 9]],
            [[27, 31], [1, 30], [1, 7]],
            [[0, -1], [1, 31], [1, 11]],
        ];

        const months = days.map(([prevDays, dayRange, nextDays], month) => {
            let html = `<h4 class="month">${month + 1}月</h4>
            <ul class="week clearfix">
                <li>日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li>六</li>
            </ul>
            <ul class="days clearfix">`;
            for (let i = prevDays[0]; i <= prevDays[1]; i++) {
                html += `<li class="cl_999"${month == 0 ? '' : ` data-date="2019-${pad(month)}-${pad(i)}"`}>${i}</li>`;
            }
            for (let i = dayRange[0]; i <= dayRange[1]; i++) {
                const date = `2019-${pad(month + 1)}-${pad(i)}`;
                html += `<li class="${this.value == date ? ' curr' : ''}" data-date="${date}">${i}</li>`;
            }
            for (let i = nextDays[0]; i <= nextDays[1]; i++) {
                html += `<li class="cl_999" data-date="${month == 11 ? '2020-01' : `2019-${pad(month + 2)}-${pad(i)}`}">${i}</li>`;
            }
            html += '</ul>';
            return html;
        }).join('');

        this.$months.html(months);

        this._registerListeners();
    }

    _registerListeners() {
        this.$el
            .on('click', '[data-date]', (e) => {
                this.value = e.currentTarget.getAttribute('data-date');
            })
            .on('click', '.J_ConfirmDate', async (e) => {
                this.props.onOk && await this.props.onOk(this.value);
                this.hide();
            })
            .on('click', '.J_HideDateModal', () => {
                this.hide();
            });
    }

    show({
        value,
        onOk
    }) {
        const date = value || '2019-01-01';
        this.props.onOk = onOk;
        this.value = date;
        this.$el.show();
        const el = this.$el.find('[data-date="' + date + '"]')[0];

        setTimeout(() => {
            if (el.getBoundingClientRect().top < 0 || el.getBoundingClientRect().top > this.$container[0].clientHeight) {
                this.$el.find('.J_DateScroll')[0].scrollTop = el.offsetTop - 60;
            }
        }, 0);
    }

    hide() {
        this.$el.hide();
    }

    set value(date) {
        this._date = date;
        this.$el.find('.curr').removeClass('curr');
        this.$el.find('[data-date="' + date + '"]')
            .addClass('curr');
    }

    get value() {
        return this._date;
    }
}
