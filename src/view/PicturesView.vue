<template>
  <el-row :gutter="15">
    <el-col :span="4">
      <el-input placeholder="图片名"
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
    <el-col :span="1">
      <el-button type="danger" @click="batchDel()">批量删除</el-button>
    </el-col>
  </el-row>

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
        <el-button type="success" @click="check(scope.row.id)">查看</el-button>
        <el-button type="danger" @click="del(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="pageSize"
                 :hide-on-single-page="true" @prev-click="toPage" @next-click="toPage" @current-change="toPage"/>

  <!-- 预览图片弹窗 -->
  <el-dialog v-model="picVisible" :title="this.picQuery.name + '.tif'" width="600" center
             :before-close="handlePicClose" destroy-on-close>
    <img :src="picturePath" style="display: block;margin-left: auto;margin-right: auto;"/>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="download()">
          下 载
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {doDelete, doGet, doPost, doPut} from "../http/httpRequest"
import {messageConfirm, messageTip, _base64ToArrayBuffer, downloadBase64File} from "../util/utils"
import {TiffV} from '../util/tiff.min.js'

TiffV()
export default {
  name: 'PicturesView',
  inject: ['reload'],
  data() {
    return {
      picVisible: false,
      picturePath: "",
      picQuery: {},
      current: 1,
      picList: [{}],
      total: 0,
      pageSize: 0,
      ids: [],
      name: ""
    }
  },
  mounted() {
    this.getPicList();
  },
  methods: {
    //搜索
    search() {
      this.getPicList();
    },
    //清空搜索框
    clear() {
      this.name = "";
      this.search();
    },
    //查看图片
    check(id) {
      doGet("/api/pics/info/" + id)
          .then(resp => {
            if (resp.data.code === 200) {
              this.picQuery = resp.data.data;
              let base64String = this.picQuery.encodedString;
              let tiff = new Tiff({buffer: _base64ToArrayBuffer(base64String)});
              let canvas = tiff.toCanvas();
              this.picturePath = canvas.toDataURL();
              this.picVisible = true;
            } else {
              messageTip(resp.data.msg, "error")
            }
          });
    },
    //下载图片
    download() {
      downloadBase64File(this.picQuery.encodedString, this.picQuery.name + ".tif");
    },
    // 关闭预览弹窗并清空已填写的图片信息
    handlePicClose() {
      this.picVisible = false;
      this.picQuery = {};
      this.picturePath = "";
    },
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
    getPicList() {
      doPost("/api/pics", {
        current: this.current,
        name: this.name
      }).then((resp) => {
        if (resp.data.code === 200) {
          this.picList = resp.data.data.list;
          this.total = resp.data.data.total;
          this.pageSize = resp.data.data.pageSize;

        }
      })
    },

    // 分页条函数,element-plus 框架会自动传来参数
    toPage(current) {
      this.current = current;
      this.getPicList()
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