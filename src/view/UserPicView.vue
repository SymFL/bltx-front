<template>
  <el-button type="primary"  @click="dialogVisible = true">上传图片</el-button>
  <el-button type="danger"  @click="batchDel()">批量删除</el-button>

  <!-- 图片列表 -->
  <el-table :data="picList" style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55"/>
    <el-table-column type=index label="序号" width="60"/>
    <el-table-column property="name" label="图片名" width="300"/>
    <el-table-column property="result" label="预测结果" width="150"/>
    <el-table-column property="probability" label="预测可能性" width="150" show-overflow-tooltip/>
    <el-table-column property="remark" label="备注" width="500" show-overflow-tooltip/>
    <el-table-column label="操作" show-overflow-tooltip>
      <template #default="scope">
        <el-button type="primary" @click="download(scope.row.id)">下载</el-button>
        <el-button type="success" @click="edit(scope.row.id)">预览</el-button>
        <el-button type="success" @click="predict(scope.row.id)">预测</el-button>
        <el-button type="danger" @click="del(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="pageSize"
                 :hide-on-single-page="true" @prev-click="toPage" @next-click="toPage" @current-change="toPage"/>

  <!-- 上传图片弹窗 -->
  <el-dialog v-model="dialogVisible" title="图片上传" width="750" center
             :before-close="handleClose" destroy-on-close>

    <el-form ref="userRefForm" :model="picQuery" label-width="140px" :rules="picRules">
      <el-form-item label="图片名：" prop="name">
        <el-input v-model="picQuery.name" style="width: 500px"/>
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
  name: 'PicturesView',
  inject: ['reload'],
  data() {
    return {
      picList: [{}],
      total: 0,
      pageSize: 0,
      picQuery:{},
      dialogVisible: false,
      ids:[],
      userRules: {
        name: [
          {required: true, message: '请输入图片名！', trigger: 'blur'},
          {pattern: /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '图片名只能包含中文、英文字母、数字、下划线，且下划线不能出现在开头与结尾', trigger: 'blur'}
          { min: 1, max: 20, message: '图片名长度在1到20之间', trigger: 'blur' }
        ],
    }
    }
  },
  mounted() {
    this.getPicList(1);
  },
  methods: {
    //多选时传回要删除的ids
    handleSelectionChange(array) {
      this.ids = [];
      array.forEach(data => {
        this.ids.push(data.id)
      })
    },
    //批量删除
    batchDel() {
      if (this.ids.length === 0) {
        messageTip("请选择要删除的图片", "warning");
        return;
      }
      let ids = this.ids.join(",");
      messageConfirm("是否要批量删除图片？").then(() => {
            doDelete("/api/pics", {ids: ids}).then((resp) => {
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
    //删除图片
    del(id) {
      messageConfirm("是否要删除该图片？").then(() => {
            doDelete("/api/pics/" + id, {}).then((resp) => {
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

    // 获取图片列表
    getPicList(current) {
      doGet("/api/pics", {current: current}).then((resp) => {
        if (resp.data.code === 200) {
          this.picList = resp.data.data.list;
          this.total = resp.data.data.total;
          this.pageSize = resp.data.data.pageSize;

        }
      })
    },

    // 分页条函数,element-plus 框架会自动传来参数
    toPage(current) {
      this.getUserList(current)
    },

    // 关闭弹窗并清空已填写的图片信息
    handleClose() {
      messageConfirm("已填入的数据不会被保存，是否关闭？")
          .then(() => {
            this.picQuery = {};
            this.dialogVisible = false;
          }).catch(() => {
      })
    },
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