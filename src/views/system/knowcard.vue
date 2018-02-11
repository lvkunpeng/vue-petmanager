<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="3" class="listleft">
        <el-button type="success" @click="addCard()">添加</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="标题" v-model="search.title"></el-input>
      </el-col>
      <el-col :span="3">
        <div class="block">
         <el-date-picker
            v-model="addTime"
            type="daterange"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="上传时间"
             @change="(value) => changeHandler(value)">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3" class="listright">
        <el-button type="primary" icon="search"  @click="inquire()">搜索</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row
              @selection-change="handleSelectionChange">
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column align="center" label='编号' width="95">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center">
        <template scope="scope">
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column label="内容" width="200" align="center">
        <template scope="scope">
          <div v-html="scope.row.content"></div>
          <!-- {{scope.row.content | lineClamp}} -->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="上传时间" width="200">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
      <el-dialog title="查看" :visible.sync="dialogFormVisible" size="large">
        
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 80%; margin-left:50px;'>
          <el-form-item label="标题">
            <el-input v-model="detail.title" ></el-input>
          </el-form-item>
          <el-form-item label="内容">
            <div class="quill-editor-example">
             <!-- quill-editor -->
            <quill-editor ref="myTextEditor"
                      v-model="detail.content"
                      :options="editorOption"
                      @blur="onEditorBlur($event)"
                      @focus="onEditorFocus($event)"
                      @ready="onEditorReady($event)">
             </quill-editor>
          <!-- <div class="html ql-editor" v-html="detail"></div> -->
        </div>
      </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false" type="">取消</el-button>
        <el-button @click="saveUs()" type="success">保存</el-button>
      </div>
    </el-dialog>
  <paging :page-total='page.total' @changeNum="changeNum"></paging> 
  </div>

</template>

<script>
  import { getTipsList, deleteTips, addTipsList, editTipsList } from '@/api/system'
  import Paging from '../common/paging.vue'
  export default {
    components: { Paging },
    data() {
      return {
        addTime: null,
        search: {
          title: null,
          serTime: null
        },
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        ids: [],
        deleteNow: [],
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        currentPage1: 1,
        detail: {
          title: '',
          content: '',
          id: ''
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
        value4: ''
      }
    },
    filters: {
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
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      },
       /**
       * 过滤器：控制字符显示长度
       */
      lineClamp(value) {
        if (value) {
          return value.length > 10 ? value.slice(0, 10) + '...' : value
        }
      }
    },
    // 构建时方法
    created() {
      this.fetchData()
    },
    methods: {
      /**
       * 获取组件数据：日记列表
       */
      fetchData() {
        var index = (this.page.currentPage - 1) * 10
        var size = this.page.pageSize
        this.listLoading = true
        const pageData = {
          '_index': index,
          '_size': size,
          'title': this.search.title,
          'searchDate': this.search.serTime
        }
        getTipsList(pageData).then(response => {
          this.list = response.records
          this.page.total = response.total
          this.listLoading = false
        }).catch(
          // 错误捕获
        )
      },
      addCard() {
        this.detail = {
          title: '',
          content: ''
        }
        this.dialogFormVisible = true
      },
      handleClick(index) {
        this.listLoading = true
        this.detail = index
        this.dialogFormVisible = true
        this.listLoading = false
      },
      saveUs() {
        if (this.detail.id) {
          editTipsList(this.detail).then(
          response => {
            this.$message({
              message: '修改知识卡片成功',
              type: 'success'
            })
            this.fetchData()
          })
          this.dialogFormVisible = false
        } else {
          addTipsList(this.detail).then(
          response => {
            this.$message({
              message: '添加知识卡片成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.fetchData()
          }
        )
        }
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
       * 删除一个
       */
      deleteOne(index, id) {
        this.deteleNow = []
        this.deleteNow.push(id)
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteTips(this.deleteNow).then((response) => {
            if (response === 0) {
              this.fetchData()
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.deteleNow = []
            }
          })
        }).catch(() => {
          this.deteleNow = []
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
            deleteTips(this.ids).then((response) => {
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
      /**
       * 模糊查询
       */
      inquire() {
        if (this.search.title || this.search.serTime) {
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
       * 自组件触发，刷新当前分页及内容
       * val 为当前页码数
       */
      changeNum(val) {
        this.page.currentPage = val
        this.fetchData()
      },
      onEditorBlur() {},
      onEditorReady() {},
      onEditorFocus() {}
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
  .listleft{
    float: left;
  }
  .listright{
    float: right;
  }

</style>
