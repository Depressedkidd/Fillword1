let docWidth, docHeight, docRatio, element = document.getElementById('content-id');

onresize = function () {
    docWidth = document.documentElement.clientWidth;
    docHeight = document.documentElement.clientHeight;

    docRatio = docWidth / docHeight;

    fullScreenProportionalElem(element, 1000, 1200);
    resizeFont(element, 1000, 1200, 50);
    
}

function fullScreenProportionalElem(elem, width, height) {
    const ratio = width / height;

    if (docRatio < ratio) {
        elem.style.width = docWidth + 'px';
        elem.style.height = Math.round(docWidth / ratio) + 'px';
        elem.style.top = Math.round(docHeight / 2 - elem.offsetHeight / 2) + 'px';
        elem.style.left = '0px';
    }
    else if (docRatio > ratio) {
        elem.style.width = Math.round(docHeight * ratio) + 'px';
        elem.style.height = docHeight + 'px';
        elem.style.top = '0px';
        elem.style.left = Math.round(docWidth / 2 - elem.offsetWidth / 2) + 'px';
    }
    else {
        elem.style.width = docWidth + 'px';
        elem.style.height = docHeight + 'px';
        elem.style.top = '0px';
        elem.style.left = '0px';
    }
}

function resizeFont(elem, width, height, size) {
    const ratio = width / height;
    if (docRatio < ratio) elem.style.fontSize = height * size / 14062 + 'vw';
    else if (docRatio > ratio) elem.style.fontSize = width * size / 14062 + 'vh';
}

onresize();