import { ElMessage,ElMessageBox } from "element-plus";

//消息提示框
export function messageTip(msg,type){
    ElMessage({
        showClose: true,
        message: msg,
        type: type, //'success' | 'warning' | 'info' | 'error'
        center: true,
        duration: 3000
    })
}

//设置浏览器本地存储token名
export function getTokenName(){
    return "bltx_token";
}

//移除浏览器本地存储的token
export function removeToken(){
    window.sessionStorage.removeItem(getTokenName());
    window.localStorage.removeItem(getTokenName());
}

//弹出确认框
export function messageConfirm(msg){
    return ElMessageBox.confirm(
        msg,
        '注意！',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
}

//下载base64图片
export function downloadBase64File(base64String, filename) {
    // 将base64字符串转换为Blob对象
    let byteNumbers = _base64ToArrayBuffer(base64String);
    let byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], {type: "image/tiff"});

    // 创建一个指向Blob对象的URL
    let url = URL.createObjectURL(blob);

    // 创建一个新的<a>元素并设置其href属性为这个URL，download属性为文件名
    let link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 模拟点击这个<a>元素来开始下载
    link.click();

    // 释放URL对象
    URL.revokeObjectURL(url);
}

//将Base64编码的字符串转换为ArrayBuffer
export function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}