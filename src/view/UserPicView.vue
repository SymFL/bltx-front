<template>
  <el-row>
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
    <el-col :span="2" style="display: flex;justify-content: center;align-items: center;">
      <el-button type="primary" @click="dialogVisible = true">上传图片</el-button>
    </el-col>
    <el-col :span="1">
      <el-button type="danger" @click="batchDel()">批量删除</el-button>
    </el-col>
  </el-row>

  <!-- 图片列表 -->
  <el-table :data="picList" style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55"/>
    <el-table-column type=index label="序号" width="60" align="center"/>
    <el-table-column property="name" label="图片名" width="300" align="center"/>
    <el-table-column property="result" label="预测结果" width="150" align="center"/>
    <el-table-column property="probability" label="预测可能性（%）" width="150" show-overflow-tooltip align="center"/>
    <el-table-column property="remark" label="备注" width="500" show-overflow-tooltip align="center"/>
    <el-table-column label="操作" show-overflow-tooltip align="center">
      <template #default="scope">
        <el-button type="success" @click="check(scope.row.id)">查看</el-button>
        <el-button type="info" @click="predict(scope.row.id)">预测</el-button>
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
    <el-form ref="picRefForm" :model="picQuery" label-width="140px" :rules="picRules">
      <el-form-item label="图片名：" prop="name">
        <el-input v-model="picQuery.name" style="width: 500px"/>
      </el-form-item>

      <el-form-item label="图片：" prop="pic">
        <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload">
          <img v-if="picturePath" :src="picturePath" class="avatar"/>
          <el-icon v-else class="avatar-uploader-icon">
            <Plus/>
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="备注：" prop="remark">
        <el-input
            v-model="picQuery.remark"
            maxlength="300"
            style="width: 500px"
            show-word-limit
            type="textarea"
            rows="10"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="upload()">
          提 交
        </el-button>
      </div>
    </template>
  </el-dialog>

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
import {messageConfirm, messageTip,downloadBase64File,_base64ToArrayBuffer} from "../util/utils"
import {TiffV} from '../util/tiff.min.js'

TiffV()
export default {
  name: 'PicturesView',
  inject: ['reload'],
  data() {
    return {
      picVisible: false,
      picList: [{}],
      total: 0,
      pageSize: 0,
      current: 1,
      name: "",
      picQuery: {
        name:"",
        remark:""
      },
      dialogVisible: false,
      ids: [],
      picRules: {
        name: [
          {required: true, message: '请输入图片名！', trigger: 'blur'},
          {
            pattern: /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
            message: '图片名只能包含中文、英文字母、数字、下划线，且下划线不能出现在开头与结尾',
            trigger: 'blur'
          },
          {min: 1, max: 20, message: '图片名长度在1到20之间', trigger: 'blur'}
        ],
        remark: [
          {min: 0, max: 300, message: '备注最多为300字', trigger: 'blur'}
        ],
        pic: [
          {required: true, message: '请选择图片！', trigger: 'blur'},
        ]
      },
      picturePath: "",
      pictureFile: ""
    }
  },
  mounted() {
    this.getPicList();
  },
  methods: {
    //预测
    predict(id){
      doGet("/api/userPics/predict/" + id)
          .then(resp => {
            if (resp.data.code === 200) {
              messageTip("预测成功！","success");
              this.getPicList();
            } else {
              messageTip(resp.data.msg, "error")
            }
          });
    },
    //搜索
    search(){
      this.getPicList();
    },
    //下载图片
    download() {
      downloadBase64File(this.picQuery.encodedString, this.picQuery.name + ".tif");
    },
    //查看图片
    check(id) {
      doGet("/api/userPics/info/" + id)
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
    //上传图片
    upload() {
      this.$refs.picRefForm.validate((isValid) => {
        if (isValid) {
          let formData = new FormData();
          formData.append('name', this.picQuery.name);
          formData.append('remark', this.picQuery.remark);
          formData.append('picture', this.pictureFile);
          // 添加
          doPost('/api/userPics/upload',
              formData
          ).then(resp => {
            if (resp.data.code === 200) {
              messageTip("上传成功！", "success");
              this.reload();
            } else {
              messageTip(resp.data.msg, "error")
            }
          })
        }
      })
    },
    //添加图片并预览
    beforeAvatarUpload(rawFile) {
      if (rawFile.type !== 'image/tif' && rawFile.type !== 'image/tiff') {
        messageTip('文件类型有误,请上传tif或tiff格式的图片', "error");
        return false;
      } else {
        this.pictureFile = rawFile;
        this.picQuery.pic = rawFile.name;
        // 创建一个新的 Promise
        let promise = new Promise((resolve, reject) => {
          let fr = new FileReader();
          fr.readAsArrayBuffer(rawFile);
          fr.onload = (e) => {
            let tiff = new Tiff({buffer: e.target.result});
            let canvas = tiff.toCanvas();
            this.picturePath = canvas.toDataURL();
            // 在文件读取完成后解析 Promise
            resolve();
          };
        });
        // 在 Promise 解析后返回 false
        return promise.then(() => false);
      }
    },
    //清空搜索框
    clear() {
      this.name = "";
      this.search();
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
      doPost("/api/userPics",
          {
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
      this.getPicList();
    },

    // 关闭弹窗并清空已填写的图片信息
    handleClose() {
      messageConfirm("已填入的数据不会被保存，是否关闭？")
          .then(() => {
            this.dialogVisible = false;
            this.picQuery = {
                name:"",
                remark:""
            };
            this.picturePath = "";
            this.pictureFile = "";
          }).catch(() => {
      })
    },

    // 关闭预览弹窗并清空已填写的图片信息
    handlePicClose() {
      this.picVisible = false;
      this.picQuery = {
        name:"",
        remark:""
      };
      this.picturePath = "";
      this.pictureFile = "";
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


.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>