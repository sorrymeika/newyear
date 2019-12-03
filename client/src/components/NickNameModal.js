import { post } from "../util";
import toast from "./toast";

export default class NickNameModal {
    constructor() {
        this.props = {};

        this.$el = $(
            `<div class="app-modal app-nickname" style="display:none">
                <div class="app-modal-con">
                    <div class="app-modal-scroll ofy_s">
                        <div class="app-modal-title pb_m">设置昵称</div>
                        <div class="app-login-form-item flex">
                            <input class="J_NickName fx_1" placeholder="昵称" value="" />
                        </div>
                    </div>
                    <div class="app-modal-footer">
                        <button class="J_Confirm btn_confirm">确定</button>
                    </div>
                </div>
            </div>`
        );

        this.$nickName = this.$el.find('.J_NickName');
        this.$el.appendTo(document.body);

        this._registerListeners();
    }

    get nickName() {
        return this.$nickName.val();
    }

    set(val) {
        this.$nickName.val(val || '');
    }

    _registerListeners() {
        this.$el
            .on('click', '.J_HideModal', () => {
                this.hide();
            })
            .on('click', '.J_Confirm', async () => {
                if (!this.nickName) {
                    toast.showToast('请输入您的昵称');
                    return;
                }

                try {
                    await post('/setNickName', {
                        nickName: this.nickName
                    });
                    this.props.onConfirm && await this.props.onConfirm(this.nickName);
                    this.hide();
                } catch (e) {
                    toast.showToast(e.message || '网络异常');
                }
            });
    }

    show({
        nickName,
        onConfirm
    }) {
        this.props.onConfirm = onConfirm;
        this.set(nickName);
        this.$el.show();
    }

    hide() {
        this.$el.hide();
    }
}