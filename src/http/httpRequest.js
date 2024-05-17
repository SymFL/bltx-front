// axios 封装
import axios from "axios";
import { getTokenName, messageConfirm,messageTip,removeToken } from "../util/utils"


//定义后端接口地址的前缀
axios.defaults.baseURL = "http://localhost:10086";

export function doGet(url, params) {
    return axios({
        method: "get",
        url: url,
        params: params,
        dataType: "json"
    })
}

export function doPost(url, data) {
    return axios({
        method: "post",
        url: url,
        data: data,
        dataType: "json"
    })
}

export function doDelete(url, params) {
    return axios({
        method: "delete",
        url: url,
        params: params,
        dataType: "json"
    })
}

export function doPut(url, data) {
    return axios({
        method: "put",
        url: url,
        data: data,
        dataType: "json"
    })
}

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    // 获取浏览中存储的 token
    let token = window.sessionStorage.getItem(getTokenName());
    if (!token) {
        token = window.localStorage.getItem(getTokenName());
        config.headers['rememberMe'] = "true";
    }
    // 如果 token 存在，则加入到 http 的 Head 里
    if (token) {
        config.headers['Authorization'] = token;
    }

    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if(response.data.code > 900){
        removeToken();
        messageConfirm(response.data.msg + ",是否重新登录？").then(() => {
            window.location.href = "/"
        }).catch(() => {
            messageTip("当前为未登录状态！","warning")
        })
    }
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});