<!-- 登录页面 -->
<template>
    <el-container>
        <el-aside width="200px">
            <img src="../assets/LoginView_el-aside.jpeg" />
            <p class="imgTitle">
                欢迎使用病理图像分类系统
            </p>
        </el-aside>
        <el-main>
            <p class="formTitle">
                欢迎登录
            </p>
            <el-form ref="loginRefForm" :model="user" label-width="120px" :rules="loginRules">
                <el-form-item label="账号：" prop="loginAct">
                    <el-input v-model="user.loginAct" />
                </el-form-item>
                <el-form-item label="密码：" prop="loginPwd">
                    <el-input type="password" v-model="user.loginPwd" />
                </el-form-item>
                <el-form-item>
                    <el-checkbox label="记住我" v-model="user.rememberMe" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登 录</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
import { doPost, doGet } from "../http/httpRequest";
import { messageTip, getTokenName, removeToken } from "../util/utils";

export default {
    name: 'LoginView',
    data() {
        return {
            user: {},
            loginRules: {
                loginAct: [
                    { required: true, message: '请输入账号！', trigger: 'blur' },
                ],
                loginPwd: [
                    { required: true, message: '请输入密码！', trigger: 'blur' },
                    { min: 6, max: 16, message: '密码长度为6-16', trigger: 'blur' },
                ]
            }
        }
    },
    methods: {
        // 登录
        login() {
            this.$refs.loginRefForm.validate((isValid) => {
                if (isValid) {
                    let formData = new FormData();
                    formData.append("loginAct", this.user.loginAct);
                    formData.append("loginPwd", this.user.loginPwd);
                    formData.append("rememberMe", this.user.rememberMe);

                    doPost("/api/login", formData).then((resp) => {
                        if (resp.data.code === 200) {
                            messageTip("登录成功！", "success");
                            // 清除原有的 token
                            removeToken();
                            // 将 token 存入浏览器
                            if (this.user.rememberMe === true) {
                                window.localStorage.setItem(getTokenName(), resp.data.data)
                            } else {
                                window.sessionStorage.setItem(getTokenName(), resp.data.data)
                            }
                            window.location.href = '/dashboard';
                        } else {
                            messageTip("登录失败！", "error");
                        }
                    })
                }
            })
        },

        // 免登录，在渲染页面时执行
        freeLogin() {
            // 获取浏览器本地 token
            let token = window.localStorage.getItem(getTokenName());
            // 如果 token 存在，访问免登录接口
            if (token) {
                doGet("/api/login/free", {}).then((resp) => {
                    if (resp.data.code === 200) {
                        window.location.href = "/dashboard";
                    }
                })
            }
        }
    },
    mounted() {
        this.freeLogin()
    }
}
</script>

<style scoped>
.el-aside {
    width: 40%;
    background-color: cyan;
    text-align: center;
}

.el-main {
    height: calc(100vh);
}

img {
    height: 400px;
    margin-top: 10%;
}

.imgTitle {
    color: black;
    font-size: 25px;
}

.el-form {
    width: 40%;
    margin: auto;
}

.formTitle {
    color: black;
    font-size: 25px;
    width: 40%;
    margin-top: 25%;
    margin-left: 50%;
}

.el-button {
    width: 100%;
}
</style>
