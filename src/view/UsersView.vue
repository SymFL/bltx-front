<template>
  <el-row>
    <el-col :span="4">
      <el-input placeholder="姓名"
                v-model="name" clearable @clear="clear()">
        <template #append>
          <el-button @click="search()">
            <el-icon>
              <search/>
            </el-icon>
          </el-button>
        </template>
      </el-input>
    </el-col>
    <el-col :span="2" style="display: flex;justify-content: center;align-items: center;">
      <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
    </el-col>
    <el-col :span="1">
      <el-button type="danger"  @click="arrayDel()">批量删除</el-button>
    </el-col>
  </el-row>

  <!-- 用户列表 -->
  <el-table :data="userList" style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55"/>
    <el-table-column type=index label="序号" width="60"/>
    <el-table-column property="loginAct" label="账号" width="200"/>
    <el-table-column property="name" label="姓名" width="150"/>
    <el-table-column property="phone" label="手机" width="200" show-overflow-tooltip/>
    <el-table-column property="email" label="邮箱" width="300" show-overflow-tooltip/>
    <el-table-column property="createTime" label="创建时间" width="300" show-overflow-tooltip/>
    <el-table-column label="操作" show-overflow-tooltip>
      <template #default="scope">
        <el-button type="primary" @click="view(scope.row.id)">详情</el-button>
        <el-button type="success" @click="edit(scope.row.id)">编辑</el-button>
        <el-button type="danger" @click="del(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="pageSize"
                 :hide-on-single-page="true" @prev-click="toPage" @next-click="toPage" @current-change="toPage"/>

  <!-- 添加/编辑用户弹窗 -->
  <el-dialog v-model="dialogVisible" :title="this.userQuery.id > 0 ? '修改用户' : '添加用户'" width="750" center
             :before-close="handleClose" destroy-on-close>

    <el-form ref="userRefForm" :model="userQuery" label-width="140px" :rules="userRules">
      <el-form-item label="账号：" prop="loginAct">
        <el-input v-model="userQuery.loginAct" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="密码：" v-if="this.userQuery.id > 0">
        <el-input type="password" v-model="userQuery.loginPwd" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="密码：" prop="loginPwd" v-else>
        <el-input type="password" v-model="userQuery.loginPwd" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="姓名：" prop="name">
        <el-input v-model="userQuery.name" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="手机：" prop="phone">
        <el-input v-model="userQuery.phone" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="userQuery.email" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="账号是否被启用：" prop="accountEnabled">
        <el-select v-model="userQuery.accountEnabled" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="addUser">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {doDelete, doGet, doPost, doPut} from "../http/httpRequest"
import {messageConfirm, messageTip} from "../util/utils"


export default {
  name: 'UsersView',
  inject: ['reload'],
  data() {
    return {
      userList: [{}],
      total: 0,
      pageSize: 0,
      userQuery: {},
      dialogVisible: false,
      ids:[],
      name:"",
      userRules: {
        loginAct: [
          {required: true, message: '请输入账号！', trigger: 'blur'},
        ],
        loginPwd: [
          {required: true, message: '请输入密码！', trigger: 'blur'},
          {min: 6, max: 16, message: '密码长度为6-16', trigger: 'blur'},
        ],
        name: [
          {required: true, message: '请输入姓名！', trigger: 'blur'},
          {pattern: /^[\u4e00-\u9fa5]+$/, message: '姓名只能为中文', trigger: 'blur'}
        ],
        phone: [
          {required: true, message: '请输入手机号码！', trigger: 'blur'},
          {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱！', trigger: 'blur'},
          {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
          }
        ],
        accountEnabled: [
          {required: true, message: '请选择账号是否被启用！', trigger: 'blur'},
        ]
      },
      options: [
        {
          value: 1,
          label: '是',
        },
        {
          value: 0,
          label: '否',
        },

      ]

    }
  },
  mounted() {
    this.getUserList(1);
  },
  methods: {
    search(){
      this.getUserList()
    },
    clear(){
      this.name = "";
      this.getUserList()
    },
    //多选时传回要删除的ids
    handleSelectionChange(array){
      this.ids = [];
      array.forEach(data =>{
        this.ids.push(data.id)
      })
    },
    //批量删除
    arrayDel(){
      if(this.ids.length  === 0){
        messageTip("请选择要删除的用户","warning");
        return;
      }
      let ids = this.ids.join(",");
      messageConfirm("是否要批量删除用户？").then(() => {
            doDelete("/api/users", {ids : ids}).then((resp) => {
              if (resp.data.code === 200) {
                messageTip("删除成功！", "success")
                this.reload();
              } else {
                messageTip(resp.data.msg, "error")
              }
            })
          }
      ).catch(() => {
        messageTip("取消删除", "success")
      })
    },
    //删除用户
    del(id) {
      messageConfirm("是否要删除该用户？").then(() => {
            doDelete("/api/users/" + id, {}).then((resp) => {
              if (resp.data.code === 200) {
                messageTip("删除成功！", "success")
                this.reload();
              } else {
                messageTip(resp.data.msg, "error")
              }
            })
          }
      ).catch(() => {
        messageTip("取消删除", "success")
      })
    },

    // 获取用户列表
    getUserList(current) {
      doGet("/api/users", {
        current: current,
        name:this.name
      }).then((resp) => {
        if (resp.data.code === 200) {
          this.userList = resp.data.data.list;
          this.total = resp.data.data.total;
          this.pageSize = resp.data.data.pageSize;
        }
      })
    },

    // 分页条函数,element-plus 框架会自动传来参数
    toPage(current) {
      this.getUserList(current)
    },

    // 跳转到用户详情页面
    view(id) {
      this.$router.push("/dashboard/users/" + id);
    },

    // 关闭弹窗并清空已填写的用户数据
    handleClose() {
      messageConfirm("已修改的数据不会被保存，是否关闭？")
          .then(() => {
            this.userQuery = {};
            this.dialogVisible = false;
          }).catch(() => {
      })
    },

    // 添加/修改用户提交
    addUser() {
      this.$refs.userRefForm.validate((isValid) => {
        if (isValid) {
          let formData = new FormData;
          for (let field in this.userQuery) {
            formData.append(field, this.userQuery[field]);
          }
          if (this.userQuery.id > 0) {
            // 编辑
            doPut('/api/users/edit', formData).then(resp => {
              if (resp.data.code === 200) {
                messageTip("修改成功！", "success");
                this.reload();
              } else {
                messageTip("修改失败！", "error")
              }
            })
          } else {
            // 添加
            doPost('/api/users/add', formData).then(resp => {
              if (resp.data.code === 200) {
                messageTip("添加成功！", "success");
                this.reload();
              } else {
                messageTip("添加失败！", "error")
              }
            })
          }
        }
      })
    },

    // 获取用户详细信息
    getUserInfo(id) {
      doGet("/api/users/" + id).then(resp => {
        if (resp.data.code === 200) {
          this.userQuery = resp.data.data;
          this.userQuery.loginPwd = ""
        } else {
          messageTip("系统出错，请稍候!", "warning");
        }
      })
    },

    // 弹出编辑用户窗口
    edit(id) {
      this.getUserInfo(id);
      this.dialogVisible = true;
    }
  }
}
</script>

<style scoped>
.el-table {
  margin-top: 12px;
}

.el-pagination {
  margin-top: 12px;
}
</style>