<!-- 主页面 -->
<template>
  <el-container>
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="menuTitle">@病理图像分类</div>
      <!-- 左侧菜单 -->
      <el-menu active-text-color="#ffd04b" background-color="#333333" class="el-menu-vertical-demo" default-active="2"
               text-color="#fff" style="border-right: solid 0px" :unique-opened="true" :collapse-transition="false"
               :collapse="isCollapse" :router="true">
        <el-menu-item index="/dashboard/users">
          <el-icon>
            <UserFilled/>
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/dashboard/pictures">
          <el-icon>
            <Picture/>
          </el-icon>
          <span>图片管理</span>
        </el-menu-item>
        <el-menu-item index="/dashboard/userPic">
          <el-icon>
            <Picture/>
          </el-icon>
          <span>分类预测</span>
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
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
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
      <el-footer>@版权所有 时间 公司名 公司地址</el-footer>
    </el-container>
  </el-container>
</template>

<script>
import {doGet} from "../http/httpRequest"
import {messageConfirm, messageTip, removeToken} from "../util/utils";

export default {
  name: 'DashboardView',
  data() {
    return {
      // 控制左侧菜单水平展开和收起，展开是false，收起是true
      isCollapse: false,
      user: {},
      // 控制右侧组件是否显示
      isRouterAlive: true
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