export default class DropDown {
    constructor() {
        this.props = {};
        this.$el = $(
            `<div class="app-dropdown-modal" style="display:none">
                <div class="app-dropdown">
                    <div class="J_DropDownTitle app-dropdown-title">asdf</div>
                    <div class="app-dropdown-con ofy_s">
                        <ul class="J_DropDownContent">
                            <li data-value="asdf" class="J_Item app-dropdown-item">asdfasf</li>
                        </ul>
                    </div>
                </div>
            </div>`
        );
        this.$title = this.$el.find('.J_DropDownTitle');
        this.$content = this.$el.find('.J_DropDownContent');

        this.$el.appendTo(document.body);

        this._registerListener();
    }

    _registerListener() {
        this.$el.on('click', (e) => {
            if (e.target.classList.contains('app-dropdown-modal')) {
                this.hide();
            }
        });

        this.$content.on('click', '.J_Item', (e) => {
            this.props.onSelect(e.currentTarget.getAttribute('data-value'));
            this.hide();
        });
    }

    show({
        title,
        data,
        defaultValue,
        onSelect
    }) {
        this.props.onSelect = onSelect;
        this.data = data;
        this.defaultValue = defaultValue;
        this.$title.html(title);
        this.render();
        this.$el.show();
    }

    hide() {
        this.$el.hide();
    }

    render() {
        const html = this.data.map(({ value, label }) => {
            return `<li data-value="${value}" class="J_Item app-dropdown-item bd_b${this.defaultValue == value ? ' curr' : ''}">${label}</li>`;
        })
            .join('');

        this.$content.html(html);
    }
}