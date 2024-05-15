import { ElMessage,ElMessageBox } from "element-plus";

export function messageTip(msg,type){
    ElMessage({
        showClose: true,
        message: msg,
        type: type, //'success' | 'warning' | 'info' | 'error'
        center: true,
        duration: 3000
    })
}

export function getTokenName(){
    return "yssw_token";
}

export function removeToken(){
    window.sessionStorage.removeItem(getTokenName());
    window.localStorage.removeItem(getTokenName());
}

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