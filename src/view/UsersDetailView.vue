<template>
    <div>
        <el-form ref="UserDetailForm" label-width="150px">
            <el-form-item label="ID：">
                <div class="detail">&nbsp;{{ userDetail.id }}</div>
            </el-form-item>

            <el-form-item label="账号：">
                <div class="detail">&nbsp;{{ userDetail.loginAct }}</div>
            </el-form-item>
            
            <el-form-item label="密码：">
                <div class="detail">&nbsp;*********</div>
            </el-form-item>
            
            <el-form-item label="姓名：">
                <div class="detail">&nbsp;{{ userDetail.name }}</div>
            </el-form-item>
            
            <el-form-item label="手机：">
                <div class="detail">&nbsp;{{ userDetail.phone }}</div>
            </el-form-item>
            
            <el-form-item label="邮箱：">
                <div class="detail">&nbsp;{{ userDetail.email }}</div>
            </el-form-item>
            
            <el-form-item label="账号是否被启用：">
                <div class="detail">&nbsp;{{ userDetail.accountEnabled === 1 ? "否" : "是" }}</div>
            </el-form-item>
            
            <el-form-item label="创建时间：">
                <div class="detail">&nbsp;{{ userDetail.createTime }}</div>
            </el-form-item>
            
            <el-form-item label="创建人：">
                <div class="detail">&nbsp;{{ userDetail.createByDo.name }}</div>
            </el-form-item>
            
            <el-form-item label="编辑时间：">
                <div class="detail">&nbsp;{{ userDetail.editTime }}</div>
            </el-form-item>

            <el-form-item label="编辑人：">
                <div class="detail">&nbsp;{{ userDetail.editByDo.name }}</div>
            </el-form-item>

            <el-form-item label="最近登录时间：">
                <div class="detail">&nbsp;{{ userDetail.lastLoginTime }}</div>
            </el-form-item>
            
            <el-form-item>
                <el-button type="primary" @click="goback">返 回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { doGet } from '../http/httpRequest';

export default {
    name: '',
    data() {
        return {
            // 存放用户详情
            userDetail : {
                createByDo : {},
                editByDo : {},
            },
        }
    },
    mounted() {
        this.loadUserDetail();
    },
    methods: {
        // 加载用户详情
        loadUserDetail() {
            // 获取动态路由中的参数，id 必须与动态路由配置的参数同名
            let id = this.$route.params.id;
            doGet("/api/users/" + id, {}).then(resp => {
                if (resp.data.code === 200) {
                    this.userDetail = resp.data.data;
                    console.log(this.userDetail);
                    if(!this.userDetail.createByDo){
                        this.userDetail.createByDo = {};
                    }
                    if(!this.userDetail.editByDo){
                        this.userDetail.editByDo = {};
                    }
                }
            });
        },

        // 返回来时的页面
        goback(){
            this.$router.go(-1);
        }
    }
}
</script>

<style scoped>
.detail {
    background-color: #F0FFFF;
    width: 100%;
    padding-left: 15px;
}
</style>