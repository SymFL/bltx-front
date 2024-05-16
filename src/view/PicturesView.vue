<template>
  <el-button type="danger"  @click="batchDel()">批量删除</el-button>

  <!-- 图片列表 -->
  <el-table :data="picList" style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55"/>
    <el-table-column type=index label="序号" width="60"/>
    <el-table-column property="name" label="图片名" width="300"/>
    <el-table-column property="result" label="预测结果" width="150"/>
    <el-table-column property="probability" label="预测可能性" width="150" show-overflow-tooltip/>
    <el-table-column property="userName" label="上传者" width="150"/>
    <el-table-column property="remark" label="备注" width="500" show-overflow-tooltip/>
    <el-table-column label="操作" show-overflow-tooltip>
      <template #default="scope">
        <el-button type="primary" @click="download(scope.row.id)">下载</el-button>
        <el-button type="success" @click="edit(scope.row.id)">预览</el-button>
        <el-button type="danger" @click="del(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="pageSize"
                 :hide-on-single-page="true" @prev-click="toPage" @next-click="toPage" @current-change="toPage"/>
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
      dialogVisible: false,
      ids:[]
    }
  },
  mounted() {
    this.getPicList(1);
  },
  methods: {
    //多选时传回要删除的ids
    handleSelectionChange(array){
      this.ids = [];
      array.forEach(data =>{
        this.ids.push(data.id)
      })
    },
    //批量删除
    batchDel(){
      if(this.ids.length  === 0){
        messageTip("请选择要删除的图片","warning");
        return;
      }
      let ids = this.ids.join(",");
      messageConfirm("是否要批量删除图片？").then(() => {
            doDelete("/api/pics", {ids : ids}).then((resp) => {
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