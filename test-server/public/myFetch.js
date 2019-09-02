function myFetch (url, cb) {
    var xhr = new XMLHttpRequest;
    xhr.open('get', url);
    xhr.responseType = 'arraybuffer';
    // xhr.setRequestHeader('Range', `bytes=0-2524488`)
    xhr.onload = function () {
        cb(xhr.response);
    };
    xhr.send();
};