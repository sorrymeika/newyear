
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

        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.width, image.height);
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
