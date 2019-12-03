
export function pad(num, n) {
    var a = '0000000000000000' + num;
    return a.substr(a.length - (n || 2));
}

const nodeWrap = document.createElement("div");
const node = document.createTextNode("");
nodeWrap.appendChild(node);

export function encodeHTML(text) {
    node.nodeValue = '' + text;
    return nodeWrap.innerHTML;
}

/**
 * date 转 string
 *
 * @param {Date|timestamp} d
 * @param {String} f 格式化字符串:yyyy-MM-dd HH:mm:ss_ffff | short | minutes
 * @return {Date}
 */
export function formatDate(d, f) {
    if (typeof d === "string" && /^\/Date\(\d+\)\/$/.test(d)) {
        d = new Function("return new " + d.replace(/\//g, ''))();
    } else if (typeof d === 'string' && !f) {
        f = d;
        d = new Date();
    } else if (typeof d === 'number') {
        d = new Date(d);
    } else if (!(d instanceof Date)) {
        return '';
    }

    var now;
    var today;
    var date;
    var initDate = function () {
        now = new Date();
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    if (f === 'minutes') {
        initDate();

        var res = '';
        if (today - date == 86400000) {
            res += '昨天 ';
        } else if (today - date == 0) {
            // res += '今天';
        } else {
            res += pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + " ";
        }
        res += pad(d.getHours()) + ':' + pad(d.getMinutes());
        return res;
    } else if (f === 'short') {
        initDate();

        if (today - date == 86400000) {
            return '昨天' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        } else if (today - date == 0) {
            var minutes = Math.round((now - d) / 60000);

            if (minutes <= 2) {
                return '刚刚';
            } else if (minutes < 60) {
                return minutes + '分钟前';
            } else {
                var hours = Math.round(minutes / 60);
                if (hours < 12) {
                    return hours + '小时前';
                } else {
                    return pad(d.getHours()) + ':' + pad(d.getMinutes());
                }
            }
        } else {
            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        }
    }

    var week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    var y = d.getFullYear() + "",
        M = d.getMonth() + 1,
        D = d.getDate(),
        H = d.getHours(),
        m = d.getMinutes(),
        s = d.getSeconds(),
        mill = d.getMilliseconds() + "0000";
    return (f || 'yyyy-MM-dd HH:mm:ss').replace(/y{4}/, y)
        .replace(/y{2}/, y.substr(2, 2))
        .replace(/M{2}/, pad(M))
        .replace(/M/, M)
        .replace(/W/, week[d.getDay()])
        .replace(/d{2,}/, pad(D))
        .replace(/d/, D)
        .replace(/H{2,}/i, pad(H))
        .replace(/H/i, H)
        .replace(/m{2,}/, pad(m))
        .replace(/m/, m)
        .replace(/s{2,}/, pad(s))
        .replace(/s/, s)
        .replace(/f+/, function (w) {
            return mill.substr(0, w.length);
        });
}

export function compressImage(imageFile, quality, cb) {
    var reader = new FileReader();
    reader.onload = async e => {
        var image = new Image();
        image.src = e.target.result;

        if (!image.complete) {
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });
        }

        const width = Math.min(750, image.width);
        const height = image.width == width ? image.height : Math.round(image.height * (width / image.width));

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        canvas.toBlob(cb, 'image/jpeg', quality);
    };
    reader.readAsDataURL(imageFile);
}

export function uploadFile(uploadUrl, blob, contentType, ext) {
    const boundary = "WebKitFormBoundaryoJ0uuJghwGS3ADUL";

    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = function (e) {
            var data = e.target.result;

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function () {
                resolve(JSON.parse(xhr.responseText));
            });
            xhr.addEventListener('error', (e) => {
                reject(e);
            });

            xhr.open("POST", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + boundary);

            xhr.withCredentials = true;

            const type = contentType || blob.type;

            sendAsBinary(xhr, '--' + boundary + '\r\n' +
                'Content-Disposition: form-data; name="file"; filename="newFile' + (ext || ('.' + type.split('/').pop())) + '"\r\nContent-Type: ' + type + '\r\n\r\n' +
                data + '\r\n' +
                '--' + boundary + '--\r\n');
        };
        fr.readAsBinaryString(blob);
    });
}

function sendAsBinary(xhr, text) {
    var data = new ArrayBuffer(text.length);
    var uia = new Uint8Array(data);
    for (var i = 0; i < text.length; i++) {
        uia[i] = (text.charCodeAt(i) & 0xff);
    }
    xhr.send(uia.buffer);
};

export function post(url, payload) {
    const complete = (result) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('%crequest%c ' + url + ' %cresult:', 'border-radius:2px;padding:0 2px;background:blue;color:#fff', 'background:rgb(220, 242, 253);color: rgb(97, 140, 160)', 'background-color: rgb(220, 242, 253); color: rgb(97, 140, 160);', result);
        }
    };

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const success = (res) => {
            complete(res);
            if (res.success) {
                resolve(res);
            } else {
                reject(res);
            }
        };
        const error = (e) => {
            const err = e.target.status === 422
                ? {
                    success: false,
                    code: -140,
                    message: '参数错误!'
                }
                : {
                    success: false,
                    code: e.target.status,
                    message: '网络错误!'
                };
            complete(err);
            reject(err);
        };

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                success(JSON.parse(xhr.responseText));
            } else {
                error({ type: 'error', target: xhr });
            }
        });

        xhr.addEventListener('error', (e) => {
            if (xhr.status === 0) {
                // 网络被页面跳转中断时等待600ms
                setTimeout(() => {
                    error(e);
                }, 600);
            } else {
                error(e);
            }
        });

        xhr.open("POST", process.env.REACT_APP_SERVER_URL + url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.withCredentials = true;

        xhr.send(payload == null ? null : JSON.stringify(payload));
    });
};

export function completeSfsUrl(src, size, quantity = '80') {
    return !src
        ? null
        : /^(https?:)?\/\//.test(src)
            ? src
            : ((process.env.REACT_APP_SFS_URL + src) + '&o=' + [size, quantity].filter((o) => !!o).join(','));
}