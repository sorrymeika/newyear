import home from './home.html';
import toast from '../components/toast';
import DatePicker from '../components/DatePicker';
import Luck from '../components/Luck';
import DropDown from '../components/DropDown';
import Love from '../components/Love';
import { compressImage, uploadFile, encodeHTML } from '../util';
import KeywordsModal from '../components/KeywordsModal';

const DATE_MAP = {
    '2019-01-01': {
        name: '新年第一天',
        placeholder: '和谁在哪里度过的?'
    },
    '2019-02-14': {
        name: '情人节',
        placeholder: '做了些什么?'
    },
    '2019-10-01': {
        name: '国庆假期',
        placeholder: '是怎样度过的?'
    },
    '2019-11-11': {
        name: '双十一',
        placeholder: '是怎样度过的?'
    },
    '2020-01-01': {
        name: '新篇章',
        placeholder: '如何迎接新的一年...'
    },
};

class Home {
    constructor() {
        this.el = document.createElement('div');
        this.el.className = "app-page";
        this.$el = $(this.el);
        this.el.innerHTML = home;
        this.$days = this.$el.find('.J_Days');
        this.$moments = this.$el.find('.J_Moments');
        this.$summary = this.$el.find('.J_Summary');
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

        this.luck = new Luck();
        this.luck.$el.appendTo(this.$el.find('.J_HomeLuck'));
        this.love = new Love(this.$el.find('.J_Love'));

        this.$loveMore = this.$el.find('.J_LoveMore');

        this.keywordsModal = new KeywordsModal();

        this.datePicker = new DatePicker();
        this.datePicker.$el.appendTo(this.$el);

        this.dropDown = new DropDown();

        this.initData();
    }

    initData() {
        const summary2019 = localStorage.getItem('2019summary');
        if (summary2019) {
            const data = JSON.parse(summary2019);
            console.log(data);
            this.set(data);
        }
    }

    _registerListeners() {
        this.$el
            .on('click', '.J_NewDay', (e) => {
                this.addNewDay();
            })
            .on('click', '.J_HomeSave', () => {
                localStorage.setItem('2019summary', JSON.stringify(this.data));
                toast.showToast('保存成功!');
            })
            .on('click', '.J_HomeSubmit', () => {
                console.log(this.data);
            })
            .on('click', '.J_Hospital', (e) => {
                this.dropDown.show({
                    title: '就医频率',
                    defaultValue: e.currentTarget.innerHTML,
                    data: [{
                        value: '0次',
                        label: '0次'
                    }, {
                        value: '1~2次',
                        label: '1~2次'
                    }, {
                        value: '3~5次',
                        label: '3~5次'
                    }, {
                        value: '5次以上',
                        label: '5次以上'
                    }],
                    onSelect(val) {
                        e.currentTarget.innerHTML = val;
                    }
                });
            })
            .on('click', '.J_HealthExamination', (e) => {
                this.dropDown.show({
                    title: '体检',
                    defaultValue: e.currentTarget.innerHTML,
                    data: [{
                        value: '没做',
                        label: '没做'
                    }, {
                        value: '做了1次',
                        label: '做了1次'
                    }, {
                        value: '做了1次以上',
                        label: '做了1次以上'
                    }],
                    onSelect(val) {
                        e.currentTarget.innerHTML = val;
                    }
                });
            })
            .on('click', '.J_Sports', (e) => {
                this.dropDown.show({
                    title: '运动频率',
                    defaultValue: e.currentTarget.innerHTML,
                    data: [{
                        value: '每天坚持',
                        label: '每天坚持'
                    }, {
                        value: '每周3~5次',
                        label: '每周3~5次'
                    }, {
                        value: '每周1~2次',
                        label: '每周1~2次'
                    }, {
                        value: '偶尔',
                        label: '偶尔'
                    }, {
                        value: '从不',
                        label: '从不'
                    }],
                    onSelect(val) {
                        e.currentTarget.innerHTML = val;
                    }
                });
            })
            .on('click', '.J_Keywords', () => {
                this.keywordsModal.show({
                    tags: [
                        '开心',
                        '健康',
                        '吃货',
                        '旅游',
                        '正能量',
                        '胖',
                        '减肥',
                        '健身',
                        '寒冬',
                        '低谷',
                        '剁手',
                    ],
                    data: this.keywords,
                    onConfirm: (keywords) => {
                        this.setKeywords({
                            ...keywords,
                            set: true
                        });
                    }
                });
            });
    }

    get data() {
        const allDays = [
            this.firstDay.data,
            ...this.days.data,
            this.newYearFirstDay.data,
        ];

        return {
            days: allDays,
            luck: this.luck.data,
            love: this.love.data,
            loveMore: this.$loveMore.val(),
            summary: this.$summary.val(),
            health: {
                healthExamination: this.$el.find('.J_HealthExamination').html(),
                sports: this.$el.find('.J_Sports').html(),
                hospital: this.$el.find('.J_Hospital').html(),
            },
            keywords: this.keywords
        };
    }

    set({
        days,
        luck,
        love,
        health,
        loveMore,
        keywords,
        summary
    }) {
        const firstDay = days.shift();
        const lastDay = days.pop();

        this.firstDay.set(firstDay);
        this.days.set(days);
        this.newYearFirstDay.set(lastDay);

        this.luck.set(luck);

        this.love.set(love);
        this.$loveMore.val(loveMore || '');
        this.$summary.val(summary || '');

        const { healthExamination, sports, hospital } = health || {};

        this.$el.find('.J_HealthExamination').html(healthExamination || '0次');
        this.$el.find('.J_Sports').html(sports || '做了1次');
        this.$el.find('.J_Hospital').html(hospital || '从不');

        this.setKeywords(keywords);
    }

    initDays() {
        this.firstDay = this.createDay({
            closeable: false,
            dateChangeable: false,
            date: '2019-01-01'
        });
        this.firstDay.$el.insertBefore(this.$days);

        this.days = this.createDays({
            days: this.defaultDays
        });

        this.newYearFirstDay = this.createDay({
            dateChangeable: false,
            closeable: false,
            date: '2020-01-01',
        });
        this.newYearFirstDay.$el.insertAfter(this.$days);
    }

    createDays({
        days
    }) {
        let components;
        const render = (days) => {
            const fragment = document.createDocumentFragment();
            components = days.map((data) => {
                const day = this.createDay({
                    ...data,
                    closeable: true,
                    dateChangeable: true
                });
                day.$el.appendTo(fragment);
                return day;
            });
            this.$days.append(fragment);
        };

        render(days);

        return {
            $el: this.$days,
            get data() {
                return components.map(item => item.data);
            },
            set: (days) => {
                this.$days.html('');
                render(days);
            }
        };
    }

    addNewDay() {
        const newDay = this.createDay({
            closeable: true,
            dateChangeable: true,
        });
        this.$days.append(newDay.$el);
    }

    createDay({
        date,
        content,
        images,
        dateChangeable,
        closeable
    }) {
        const placeholder = DATE_MAP[date] ? DATE_MAP[date].placeholder : '发生了什么...';
        const year = !date ? '2019' : date.split('-')[0];
        const title = !date ? '选择日期' : (DATE_MAP[date] ? DATE_MAP[date].name : (date.replace(/^\d+-/, '').replace('-', '月') + '日'));
        const $el = $(
            `<div class="app-form-item home_day_form_item bd_b" data-date="${date}">
                <div class="J_Title title"><b class="J_Year fs_l">${year}</b>年${dateChangeable ? `<button class="J_Date J_ShowDate date">${title}</button>` : `<span class="J_ShowDate">${title}</span>`}</div>
                ${closeable ? `<button class="iconfont icon-close J_Close"></button>` : ''}
            </div>`
        );

        $el.on('click', '.J_Close', destroy)
            .on('click', '.J_Date', (e) => {
                this.datePicker.show({
                    value: $el.attr('data-date'),
                    onOk(date) {
                        setDate(date);
                    }
                });
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

        function setDate(date) {
            $el.attr('data-date', date);
            const year = !date ? '2019' : date.split('-')[0];
            const title = !date ? '选择日期' : (DATE_MAP[date] ? DATE_MAP[date].name : (date.replace(/^\d+-/, '').replace('-', '月') + '日'));
            $el.find('J_Year').html(year);
            $el.find('.J_ShowDate').html(title);

            const placeholder = DATE_MAP[date] ? DATE_MAP[date].placeholder : '发生了什么...';
            textArea.$el.attr('placeholder', placeholder);
        }

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
                    date: $el.attr('data-date'),
                    content: textArea.data,
                    images: imageUpload.data
                };
            },
            set({ date, content, images }) {
                textArea.set(content);
                imageUpload.set(images);
                setDate(date);
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
            },
            set(val) {
                $el.val(val);
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
            }).join('');

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
            set(images) {
                $uploadBtn.siblings().remove();
                addImages(images);
                data = [...images];
            },
            destroy() {
                $el.off();
            }
        };
    }

    setKeywords({
        tags = [],
        moreTags = ''
    } = {}) {
        const $moreKeywords = this.$el.find('.J_MoreKeywords');
        $moreKeywords.siblings()
            .remove();

        const keywords = tags.concat(moreTags.split(/[,，]/))
            .filter(tag => !!tag)
            .map((tag) => {
                return `<div class="home_keywords_item">${encodeHTML(tag)}</div>`;
            });

        $moreKeywords.html(tags.length == 0 ? '选择我的2019关键字...' : '更多...')
            .before(keywords.join(''));

        this.keywords = {
            tags,
            moreTags
        };
    }
}

export default function create() {
    return new Home();
}