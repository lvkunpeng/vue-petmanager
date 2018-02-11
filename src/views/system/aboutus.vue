<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3" class="listleft">
        <!-- <el-button type="success" @click="addUs()">添加</el-button> -->
      </el-col>
    </el-row>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
      <!-- <el-table-column type="selection">
      </el-table-column> -->
      <!-- <el-table-column align="center" label='编号' width="95">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column> -->
      <el-table-column label="内容" align="center">
        <template scope="scope">
          <div v-html="scope.row.content"></div>
          <!-- {{scope.row.content | lineClamp}} -->
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="200">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template scope="scope">
          <el-button @click="getOne(scope.row)" type="text" size="small">编辑</el-button>
          <!-- <el-button type="text" size="small" @click="open()">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
    <el-dialog title="查看" :visible.sync="dialogFormVisible" size="large">
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 80%; margin-left:50px;'>
          <el-form-item label="关于我们">
            <div class="quill-editor-example">
             <!-- quill-editor -->
            <quill-editor ref="myTextEditor"
                      v-model="detail"
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
        <el-button @click="saveUs()" type="success">保存</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
  import { getUsList, aboutEdit } from '@/api/system'

  export default {
    data() {
      return {
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        currentPage1: 1,
        detail: null,
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
        }
      }
    },
    filters: {
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
       * 过滤器：控制字符显示长度
       */
      lineClamp(value) {
        return value.length > 20 ? value.slice(0, 20) + '...' : value
      }
    },
    // 构建时方法
    created() {
      this.fetchData()
    },
    methods: {
      /**
       * 获取组件数据：日记列表
       * 获取分页数据
       */
      fetchData() {
        this.listLoading = true
        getUsList().then(response => {
          this.list = response.records
          this.listLoading = false
        }).catch(
          // 错误捕获
        )
      },
      addUs() {
        alert('添加')
      },
      getOne(data) {
        this.detail = data.content
        this.dialogFormVisible = true
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      open() {
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      saveUs() {
        aboutEdit(this.detail).then(response => {
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
          this.fetchData()
        })
        this.dialogFormVisible = false
      },
      onEditorReady() {},
      onEditorFocus() {},
      onEditorBlur() {}
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

</style>
