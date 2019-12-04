import { post } from "../util";
import toast from "./toast";

export default class FeedbackModal {
    constructor() {
        this.props = {};

        this.$el = $(
            `<div class="app-modal app-feedback" style="display:none">
                <div class="app-modal-con">
                    <div class="app-modal-scroll ofy_s">
                        <div class="app-modal-title pb_m">意见反馈</div>
                        <div class="app-form-item flex">
                            <textarea class="J_FeedbackText app-text fx_1" placeholder="请描述一下您的意见或问题..."></textarea>
                        </div>
                    </div>
                    <div class="app-modal-footer">
                        <button class="J_HideModal btn_cancel">取消</button>
                        <button class="J_Confirm btn_confirm">确定</button>
                    </div>
                </div>
            </div>`
        );

        this.$feedback = this.$el.find('.J_FeedbackText');
        this.$el.appendTo(document.body);

        this._registerListeners();
    }

    get feedback() {
        return this.$feedback.val();
    }

    set(val) {
        this.$feedback.val(val || '');
    }

    _registerListeners() {
        this.$el
            .on('click', '.J_HideModal', () => {
                this.hide();
            })
            .on('click', '.J_Confirm', async () => {
                if (!this.feedback) {
                    toast.showToast('请输入您的建议或问题');
                    return;
                }

                try {
                    await post('/addFeedback', {
                        feedback: this.feedback
                    });
                    this.props.onConfirm && await this.props.onConfirm();
                    this.hide();
                    toast.showToast('提交成功，感谢您的反馈!');
                } catch (e) {
                    toast.showToast(e.message || '网络异常');
                }
            });
    }

    show({
        onConfirm
    } = {}) {
        this.props.onConfirm = onConfirm;
        this.set('');
        this.$el.show();
    }

    hide() {
        this.$el.hide();
    }
}