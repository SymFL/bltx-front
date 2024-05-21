<!-- 主页面 -->
<template>
  <el-container>
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="menuTitle">@病理图像分类</div>

      <!-- 左侧菜单 -->
      <el-menu active-text-color="#ffd04b" background-color="#333333" class="el-menu-vertical-demo" default-active="2"
               text-color="#fff" style="border-right: solid 0px" :unique-opened="true" :collapse-transition="false"
               :collapse="isCollapse" :router="true">
        <el-menu-item v-for="menu in user.menuPermissionList" :key="menu.id" :index="menu.url">
          <el-icon>
            <component :is="menu.icon"/>
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </el-menu>

    </el-aside>
    <el-container class="rightContext">
      <!-- 右侧头部 -->
      <el-header>
        <!-- 左侧菜单收起和展开 -->
        <el-icon class="showMenu" @click="shouMenu" v-if="!isCollapse">
          <Fold/>
        </el-icon>
        <el-icon class="showMenu" @click="shouMenu" v-if="isCollapse">
          <Expand/>
        </el-icon>
        <!-- 用户菜单 -->
        <el-dropdown :hide-on-click="true" trigger="click">
                    <span class="el-dropdown-link">
                        {{ user.name }}<el-icon class="el-icon--right"><arrow-down/></el-icon>
                    </span>
          <template #dropdown>
            <el-dropdown-menu>
              <!--              <el-dropdown-item>个人中心</el-dropdown-item>-->

              <el-dropdown-item @click="dialogVisible = true">修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <!-- 右侧主体 -->
      <el-main>
        <router-view v-if="isRouterAlive"/>
      </el-main>
      <!-- 右侧底部 -->
      <!--      <el-footer>@版权所有 时间 公司名 公司地址</el-footer>-->
      <el-footer></el-footer>
    </el-container>
  </el-container>

  <!-- 修改密码弹窗 -->
  <el-dialog v-model="dialogVisible" title="修改密码" width="750" center
             :before-close="handleClose" destroy-on-close>

    <el-form ref="pwdRefForm" :model="userQuery" label-width="140px" :rules="pwdRules">
      <el-form-item label="原密码：" prop="oldLoginPwd">
        <el-input type="password" v-model="userQuery.oldLoginPwd" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="新密码：" prop="newLoginPwd">
        <el-input type="password" v-model="userQuery.newLoginPwd" style="width: 500px"/>
      </el-form-item>
      <el-form-item label="重复密码：" prop="againLoginPwd">
        <el-input type="password" v-model="userQuery.againLoginPwd" style="width: 500px"/>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="changePwd">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script>
import {doGet, doPost, doPut} from "../http/httpRequest"
import {messageConfirm, messageTip, removeToken} from "../util/utils";

export default {
  name: 'DashboardView',

  data() {
    let validatePass = (rule, value, callback) => {
      const res = /^[a-zA-Z]\w{8,18}$/;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (!res.test(value)) {
        callback(
            new Error("密码以字母开头 长度在8~18之间 只能包含字母、数字和下划线")
        );
      } else {
        if (this.userQuery.newLoginPwd !== "") {
          this.$refs.pwdRefForm.validateField("newLoginPwd");
        }
        callback();
      }
    };

    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入确认密码"));
      } else if (value !== this.userQuery.newLoginPwd) {
        callback(new Error("两次输入密码不一致！"));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      userQuery: {
        oldLoginPwd: "",
        newLoginPwd: "",
        againLoginPwd: ""
      },
      // 控制左侧菜单水平展开和收起，展开是false，收起是true
      isCollapse: false,
      user: {},
      // 控制右侧组件是否显示
      isRouterAlive: true,
      pwdRules: {
        oldLoginPwd: [
          {required: true, message: '请输入原密码！', trigger: 'blur'}
        ],
        newLoginPwd: [
          {required: true, validator: validatePass, trigger: 'blur'}
        ],
        againLoginPwd: [
          {required: true, validator: validatePass2, trigger: 'blur'}
        ],
      }
    }
  },

  provide() {
    return {
      // 部分页面刷新
      reload: () => {
        this.isRouterAlive = false; // 右侧内容隐藏
        this.$nextTick(() => {   // 当数据更新了，在 dom 中渲染后，自动执行
          this.isRouterAlive = true;
        })
      }
    }
  },
  methods: {
    //修改密码
    changePwd() {
      this.$refs.pwdRefForm.validate((isValid) => {
        if (isValid) {
          messageConfirm("确定要修改密码吗？")
              .then(() => {
                doPost("/api/users/changePwd", {
                  newLoginPwd: this.userQuery.newLoginPwd,
                  oldLoginPwd: this.userQuery.oldLoginPwd
                }).then(resp => {
                  if (resp.data.code === 200) {
                    messageConfirm("密码修改成功,请重新登录！")
                        .then(() => {
                          this.logout()
                        })
                        .catch(() => {
                          this.logout()
                        })
                  } else {
                    messageTip(resp.data.msg, "error")
                  }
                })
              }).catch(() => {
          })
        }
      })
    },
    //关闭修改密码弹窗时清空数据
    handleClose() {
      messageConfirm("已修改的数据不会被保存，是否关闭？")
          .then(() => {
            this.userQuery = {
              oldLoginPwd: "",
              newLoginPwd: "",
              againLoginPwd: ""
            }
            this.dialogVisible = false
          }).catch(() => {
      })
    },
    // 左侧菜单水平展开和收起
    shouMenu() {
      this.isCollapse = !this.isCollapse;
    },

    //获取登录信息
    loginInfo() {
      doGet("/api/login/info", {}).then((resp) => {
        if (resp.data.code === 200) {
          this.user = resp.data.data;
        }
      })
    },

    // 退出登录
    logout() {
      doGet("/api/logout", {}).then((resp) => {
        if (resp.data.code === 200) {
          removeToken();
          messageTip("退出成功！", "success");
          window.location.href = "/";
        } else {
          messageConfirm("退出异常，是否强制退出？").then(() => {
            removeToken();
            messageTip("强制退出成功！", "success");
            window.location.href = "/";
          }).catch(() => {
            messageTip("当前登录状态异常，建议重新登录！", "warning");
          })
        }
      })
    }
  },
  mounted() {
    this.loginInfo();
  }
}
</script>

<style scoped>
.el-aside {
  background: black;
}

.el-header {
  background: rgb(209, 254, 255);
  height: 35px;
  line-height: 35px;
}

.el-footer {
  background: rgb(166, 254, 255);
  height: 35px;
  line-height: 35px;
  text-align: center;
}

.rightContext {
  height: calc(100vh);
}

.menuTitle {
  height: 35px;
  line-height: 35px;
  text-align: center;
  color: white;
}

.showMenu {
  cursor: pointer;
}

.el-dropdown {
  float: right;
  line-height: 35px;
  cursor: pointer;
}
</style>