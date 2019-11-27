import home from './home.html';
import { compressImage, uploadFile } from '../util';

const DATE_MAP = {
    '2019-01-01': '新年第一天',
    '2019-02-14': '情人节',
    '2019-10-01': '国庆假期',
    '2019-11-11': '双十一',
    '2020-01-01': '新篇章',
};

class Luck {
    constructor($el) {
        this.$el = $el;

        this.months = [];

        this.init();
    }

    init() {
        for (let i = 1; i <= 12; i++) {
            const month = this.createItem({
                month: i,
                luck: 50
            });
            this.months.push(month);
            this.$el.append(month.$el);
        }
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
                    <div class="fx_1 bar">
                        <div class="progress"></div>
                    </div>
                    <p class="good">完美</p>
                </div>
            </div>`
        );

        return {
            $el
        };
    }
}

class Love {
    constructor($el) {
        this.$el = $el;

        this.loves = [];
        this.init();
    }

    init() {
        const loves = [{
            placeholder: '看了哪些电影？其中最爱？'
        }, {
            placeholder: '读了哪些书？其中最爱？'
        }, {
            placeholder: '看了哪些综艺节目？其中最爱？'
        }, {
            placeholder: '看了哪些电视剧？其中最爱？'
        }, {
            placeholder: '去了哪些地方？'
        }];

        loves.map((data) => {
            const love = this.createLove(data);
            this.$el.append(love.$el);
        });
    }

    createLove({ placeholder }) {
        const $el = $(
            `<div class="app-card flex home_love_item">
                <p class="J_Content fx_1">${placeholder}</p>
                <i class="iconfont icon-enter"></i>
            </div>`
        );

        return {
            $el
        };
    }
}

class Home {
    constructor() {
        this.el = document.createElement('div');
        this.$el = $(this.el);
        this.el.innerHTML = home;
        this.$days = this.$el.find('.J_Days');
        this.$moments = this.$el.find('.J_Moments');
        this._registerListeners();

        this.defaultDays = [{
            closeable: true,
            date: '2019-02-14',
            placeholder: '做了些什么?'
        }, {
            closeable: true,
            date: '2019-10-01',
            placeholder: '是怎样度过的?'
        }, {
            closeable: true,
            date: '2019-11-11',
            placeholder: '剁手了吗?'
        }];
        this.initDays();

        this.luck = new Luck(this.$el.find('.J_Luck'));
        this.love = new Love(this.$el.find('.J_Love'));
    }

    _registerListeners() {
        this.$el
            .on('click', '.J_NewDay', (e) => {
                this.addNewDay();
            });
    }

    get data() {
        const allDays = [
            this.firstDay.data,
            ...this.days.data,
            this.newYearFirstDay.data,
        ];

        return {
            days: allDays
        };
    }

    initDays() {
        this.firstDay = this.createDay({
            closeable: false,
            dateChangeable: false,
            date: '2019-01-01',
            placeholder: '和谁在哪里度过的?'
        });
        this.firstDay.$el.insertBefore(this.$days);

        this.days = this.createDays({
            days: this.defaultDays
        });
        this.$days.append(this.days.fragment);

        this.newYearFirstDay = this.createDay({
            dateChangeable: false,
            closeable: false,
            date: '2020-01-01',
            placeholder: '如何迎接新的一年...'
        });
        this.newYearFirstDay.$el.insertAfter(this.$days);
    }

    createDays({
        days
    }) {
        const fragment = document.createDocumentFragment();
        const components = days.map((data) => {
            const day = this.createDay({
                ...data,
                closeable: true,
                dateChangeable: true
            });
            day.$el.appendTo(fragment);
            return day;
        });

        return {
            fragment,
            get data() {
                return components.map(item => item.data);
            }
        };
    }

    addNewDay() {
        const newDay = this.createDay({
            closeable: true,
            dateChangeable: true,
            placeholder: '发生了什么...'
        });
        this.$days.append(newDay.$el);
    }

    createDay({
        date,
        content,
        images,
        placeholder,
        dateChangeable,
        closeable
    }) {
        let data = {
            date,
        };
        const year = !date ? '2019' : date.split('-')[0];
        const title = !date ? '选择日期' : (DATE_MAP[date] || (date.replace(/^\d+-/, '').replace('-', '月') + '日'));
        const $el = $(
            `<div class="app-form-item home_day_form_item bd_b" data-date="${date}">
                <div class="J_Title title"><b class="fs_l">${year}</b>年${dateChangeable ? `<button class="J_Date date">${title}</button>` : `<span>${title}</span>`}</div>
                ${closeable ? `<button class="iconfont icon-close J_Close"></button>` : ''}
            </div>`
        );

        $el.on('click', '.J_Close', destroy)
            .on('click', '.J_Date', () => {
            });

        const $title = $el.find('.J_Title');
        const textArea = this.createTextArea({
            content,
            placeholder
        });
        const imageUpload = this.createImageUpload({
            images,
            onChange(data) {
            }
        });

        $title.after(textArea.$el);
        textArea.$el.after(imageUpload.$el);

        function remove() {
            $el.remove();
        }

        function destroy() {
            remove();
            $el.off();
        }

        return {
            $el,
            get data() {
                return {
                    ...data,
                    content: textArea.data,
                    images: imageUpload.data
                };
            },
            remove,
            destroy
        };
    }

    createTextArea({
        content,
        placeholder
    }) {
        const $el = $(
            `<textarea class="app-text" placeholder="${placeholder}"></textarea>`
        );
        if (content) {
            $el.val(content);
        }
        return {
            $el,
            get data() {
                return $el.val();
            }
        };
    }

    createImageUpload({
        images = [],
        onChange
    }) {
        let data = [...images];
        const $el = $(
            `<div class="J_Upload app-upload-list clearfix">
                <button class="J_UploadBtn app-upload">
                    <input class="J_File" type="file" accept="image/*" mutiple />
                    <div class="iconfont icon-add"></div>
                </button>
            </div>`
        );
        const $uploadBtn = $el.find('.J_UploadBtn');

        function addImages(newImages) {
            const html = newImages.map((img) => {
                return (
                    `<div data-key="${img.src}" class="app-upload-item app-upload">
                        <input class="J_FileReplace" type="file" accept="image/*" />
                        <img src="${process.env.REACT_APP_SFS_URL + img.src}" />
                        <button class="J_DeleteFile iconfont icon-close"></button>
                    </div>`
                );
            }).join(',');

            $uploadBtn.before(html);
        }

        addImages(images);

        $el.on('change', '.J_File', (e) => {
            const uploads = [];
            for (let i = 0; i < e.currentTarget.files.length; i++) {
                uploads.push(new Promise((resolve, reject) => {
                    compressImage(e.currentTarget.files[i], 8, (blob) => {
                        uploadFile(process.env.REACT_APP_FILE_UPLOAD_URL, blob)
                            .then(resolve)
                            .catch(reject);
                    });
                }));
            }
            Promise.all(uploads)
                .then((results) => {
                    const newImages = results.map(item => {
                        return {
                            src: item.fileName
                        };
                    });
                    addImages(newImages);
                    data = data.concat(newImages);
                    onChange && onChange(data);
                });
        })
            .on('change', '.J_FileReplace', (e) => {
                const $item = $(e.currentTarget).closest('[data-key]');
                const key = $item.attr('data-key');
                const index = data.findIndex((item) => item.src == key);
                if (index != -1) {
                    compressImage(e.currentTarget.files[0], 8, (blob) => {
                        uploadFile(process.env.REACT_APP_FILE_UPLOAD_URL, blob)
                            .then((res) => {
                                $item.attr("data-key", res.fileName);
                                data[index].src = res.fileName;
                                $item.find('img').attr('src', process.env.REACT_APP_SFS_URL + res.fileName);
                                onChange && onChange(data);
                            });
                    });
                }

            })
            .on('click', '.J_DeleteFile', (e) => {
                const $item = $(e.currentTarget).closest('[data-key]');
                const key = $item.attr('data-key');
                const index = data.findIndex((item) => item.src == key);
                if (index != -1) {
                    data.splice(index, 1);
                    $item.remove();
                    onChange && onChange(data);
                }
                return false;
            });

        return {
            $el,
            get data() {
                return data;
            },
            destroy() {
                $el.off();
            }
        };
    }

    showDateSelect() {
    }
}

export default function create() {
    return new Home();
}