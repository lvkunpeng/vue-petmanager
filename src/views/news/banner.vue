<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="2" class="btn">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="3" class="btn">
        <el-button type="success" @click="addBanner()">添加轮播图</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="标题" v-model="search.title"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="编写者" v-model="search.author"></el-input>
      </el-col>
      <el-col :span="3">
        <div class="block">
         <el-date-picker
            v-model="addTime"
            type="daterange"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="发布时间"
             @change="(value) => changeHandler(value)">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3" class="listright">
        <el-button type="primary" icon="search" @click="inquire()">搜索</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row
              @selection-change="handleSelectionChange">
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column align="center" label='编号' width="65">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="封面" align="center" width="250">
        <template scope="scope">
          <img :src=scope.row.cover style="height:100px;margin-top:8px" alt="">
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200" align="center">
        <template scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column label="编写者" min-width="100" align="center">
        <template scope="scope">
          <span>{{scope.row.author}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="发布时间" width="190">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template scope="scope">
          <el-button @click="editBanner(scope.row)" type="text" size="small">编辑</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
         <!--弹框表格-->
    <el-dialog title="轮播图管理" :visible.sync="dialogFormVisible" size="large">
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="标题">
          <el-input v-model="detail.title"  ></el-input>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
        <el-upload
          class="upload-demo"
          action="http://139.219.71.184/pic/upload"
          :on-remove="handleRemove"
          :file-list="fileList"
          :before-upload="beforeUpload"
          :on-success="successUpload"
          name="bc_cover"
          list-type="picture">
          <!-- <img  v-show="coverJudge" style="display: block;z-index: 999" :src="coverValue" alt=""> -->
          <el-button size="small" type="primary" :disabled="uploadBtn">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">推荐上传图片比例为长：宽=16:9 （例：1600px:900px;3200px:1800px px为像素）</div>
        </el-upload>
      </el-form-item>
        <el-form-item label="编写者">
          <el-input v-model="detail.author" ></el-input>
        </el-form-item>
        <el-form-item label="创建时间" v-if="detail.updateTime">
          {{detail.updateTime | dateAll}}
        </el-form-item>
        <el-form-item label="文章内容">
        <div>
         <tinymce ref="tinymce" :height="200" v-model="detail.news.content"></tinymce>
        </div>
      </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false;this.fileList = []" type="">取消</el-button>
        <el-button @click="modification()" type="success">确认</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
// import hljs from 'highlight.js'
import { getBannerList, deleteAnyBanner, addBannerList, editBannerList } from '@/api/new'
import Tinymce from '@/components/Tinymce'
  // import Quill from 'quill'
  // import { ImageImport } from '../../utils/ImageImport'
  // import { ImageResize } from '../../utils/ImageResize'
  // Quill.register('modules/imageImport', ImageImport)
  // Quill.register('modules/imageResize', ImageResize)
export default {
  components: { Tinymce },
  data() {
    return {
      ids: [],
      deleteNow: [],
      list: null,
      listLoading: true,
      page: {
        total: 100,
        currentPage: 1
      },
      search: {
        title: null,
        author: null,
        serTime: null
      },
      editorOption: {
        modules: {
          toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': [] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['clean']
          ]
          // syntax: {
          //   highlight: text => hljs.highlightAuto(text).value
          // }
        }
      },
      detail: {
        title: '',
        author: '',
        news: {
          cover: '',
          content: ''
        },
        updateTime: ''
      },
      dialogFormVisible: false,
      dialogVisible: false,
      multipleSelection: [],
      addTime: null,
      uploadBtn: false,
      nowTime: null,
      currentPage1: 1,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value3: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      value4: '',
      ruleForm: {
        title: '',
        name: '',
        desc: ''
      },
      rules: {
        title: [
          {
            required: true,
            message: '请输入文章标题',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '请输入编写者名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 5,
            message: '长度在 3 到 5 个字符',
            trigger: 'blur'
          }
        ],
        cover: [
          {
            required: true,
            message: '请上传封面图片',
            trigger: 'blur'
          }
        ]
      },
      fileList: []
    }
  },
  filters: {
      /**
       * 过滤器：状态
       */
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    },
      /**
       * 过滤器：时间全部格式 年月日时分秒
       */
    dateAll(input) {
      var d = new Date(input)
      var year = d.getFullYear()
      var month = d.getMonth() + 1
      var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate()
      var hour = d.getHours()
      var minutes = d.getMinutes()
      var seconds = d.getSeconds()
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
    },
      /**
       * 过滤器：时间简略格式 年月日
       */
    dateSm(input) {
      var d = new Date(input)
      var year = d.getFullYear()
      var month = d.getMonth() + 1
      var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate()
      return year + '-' + month + '-' + day + ' '
    },
      /**
       * 过滤器：控制字符显示长度
       */
    lineClamp(value) {
      return value.length > 5 ? value.slice(0, 5) + '...' : value
    }
  },
    // 构建组件之前执行方法的钩子
  created() {
    this.fetchData()
  },
  methods: {
    /**
       * 获取组件数据：日记列表
       * 获取分页数据
       */
    fetchData() {
      var index = (this.page.currentPage - 1) * 10
      var size = this.page.pageSize
      this.listLoading = true
      const pageData = {
        '_index': index,
        '_size': size,
        'title': this.search.title,
        'author': this.search.author,
        'searchDate': this.search.serTime
      }
      getBannerList(pageData).then(response => {
        this.list = response.records
        this.page.total = response.total
        this.listLoading = false
      }).catch(
          // 错误捕获
        )
    },
    /**
       * 更改多选列表
       */
    handleSelectionChange(val) {
      var idsNow = []
      this.multipleSelection = val
      this.multipleSelection.map((item) => {
        idsNow.push(item.id)
      })
      this.ids = idsNow
    },
       /**
       * 自组件触发，刷新当前分页及内容
       * val 为当前页码数
       */
    changeNum(val) {
      this.page.currentPage = val
      this.fetchData()
    },
      /**
       * 上传图片一张之后给按钮禁用
       */
    handleRemove(file, fileList) {
      if (this.fileList.length == 1) {
        this.fileList = []
        this.uploadBtn = false
      }
    },
       /**
       * 上传图片之前判断是否一个图片
       */
    beforeUpload(file) {
      if (this.fileList.length >= 1) {
        this.$message({
          type: 'error',
          message: '最多上传1张图片',
          duration: 1000
        })
        return false
      }
    },
      /**
       * 成功上传图片给列表赋值,并在编辑模式下隐藏原封面
       */
    successUpload(response, file, fileList) {
      this.fileList.push({
        name: response.fileName,
        url: response.url
      })
      this.uploadBtn = true
        // this.coverJudge = false
    },
    editBanner(index) {
      this.fileList = []
      this.listLoading = true
      this.detail = {
        title: '',
        author: '',
        news: {
          cover: '',
          content: ''
        },
        updateTime: ''
      }
      this.$nextTick(() => {
        this.$refs.tinymce.setContent(this.detail.news.content)
      }
      )
      // this.$refs.Tinymce.setContent('LALAL')
      this.detail = index
      this.dialogFormVisible = true
      this.fileList.push({
        name: 'name',
        url: index.news.cover
      })
      this.listLoading = false
    },
    addBanner() {
      this.fileList = []
      this.detail = {
        title: '',
        author: '',
        news: {
          cover: '',
          content: ''
        },
        updateTime: ''
      }
      this.dialogFormVisible = true
    },
      /**
       * 确认修改或者添加轮播图
       * @augments
       */
    modification() {
      if (this.detail.id) {
        const data = {
          title: this.detail.title,
          author: this.detail.author,
          cover: this.fileList[0].url,
          content: this.detail.news.content,
          id: this.detail.id
        }
        editBannerList(data).then(
          response => {
            this.$message({
              message: '修改轮播图成功',
              type: 'success'
            })
            this.fetchData()
          })
        this.dialogFormVisible = false
      } else {
        const data = {
          title: this.detail.title,
          author: this.detail.author,
          cover: this.fileList[0].url,
          content: this.detail.news.content
        }
        addBannerList(data).then(
          response => {
            this.$message({
              message: '添加轮播图成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.fetchData()
          }
        )
      }
    },
    /**
     * 模糊查询
     */
    inquire() {
      if (this.search.title || this.search.author || this.search.serTime) {
        this.fetchData()
      } else {
        this.$message({
          message: '缺少查询选项默认显示所有数据',
          type: 'warning'
        })
        this.fetchData()
      }
    },
     /**
       * 时间组件更改触发查询时间值
       * val 为格式化之后的时间参数 yyyy-MM-dd - yyyy-MM-dd
       */
    changeHandler(val) {
      this.search.serTime = val
    },
    /**
       * 删除一个
       */
    deleteOne(index, id) {
      console.log('当前' + this.deteleNow)
      this.deleteNow = []
      console.log(id)
      this.deleteNow.push(id)
      console.log(this.deleteNow)
      this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAnyBanner(this.deleteNow).then((response) => {
          if (response === 0) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.deleteNow = []
          }
        })
      }).catch(() => {
        this.deleteNow = []
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
      /**
       * 批量删除
       */
    deteleAll() {
      if (this.ids.length) {
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAnyBanner(this.ids).then((response) => {
            if (response === 0) {
              this.fetchData()
              this.$message({
                type: 'success',
                message: '删除成功'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.$message({
          message: '请先选中一条项目在试',
          type: 'warning'
        })
      }
    },
    onEditorFocus() {},
    onEditorBlur() {},
    onEditorReady() {}
  }
}
</script>
<style lang="scss" scoped>
  .toplist {
    margin-bottom: 15px;
  }

  .pagelist {
    text-align: center;
    margin-top: 20px;
  }

  .listright {
    float: right;
  }

  .btn {
    margin-right: 10px;
  }

</style>
