export default function myFetch (url, start = 0, end = 20000, cb) {
    var xhr = new XMLHttpRequest;
    xhr.open('get', url);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Range', `bytes=${start}-${end}`)
    xhr.onload = function () {
        cb(xhr.response);
    };
    xhr.send();
};