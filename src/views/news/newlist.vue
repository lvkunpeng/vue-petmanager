<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="2" class="btn">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="2" class="btn">
        <el-button type="success" @click="addNews">添加资讯</el-button>
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
          >
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
      <el-table-column label="封面" align="center" width="300">
        <template scope="scope">
          <img :src=scope.row.cover alt="" style="height:100px;margin-top:8px">
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="200" align="center">
        <template scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column label="编写者" width="120" align="center">
        <template scope="scope">
          {{scope.row.author | lineClamp}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="发布时间" width="190">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template scope="scope">
          <el-button @click="editNews(scope.row.id)" type="text" size="small">编辑</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页器-->
   <paging :page-total='page.total' @changeNum="changeNum"></paging> 
  </div>

</template>

<script>
  // 引入分页组件
  import Paging from '../common/paging.vue'
  import { getList, deleteArticleAny } from '@/api/new'
  export default {
        // 引入需要的组件
    components: { Paging },
    data() {
      return {
        search: {
          title: null,
          author: null,
          serTime: null
        },
        // 时间插件的映射值，非查询值
        addTime: null,
        list: null,
        listLoading: true,
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        ids: [],
        deleteNow: [],
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        uploadBtn: false,
        nowTime: null,
        options: [{
          value: '选项1',
          label: '视频'
        }, {
          value: '选项2',
          label: '图片'
        }],
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
          'title': this.search.title,
          'author': this.search.author,
          '_index': index,
          '_size': size,
          'searchDate': this.search.serTime
        }
        getList(pageData).then(response => {
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
       * 删除一个
       */
      deleteOne(index, id) {
        this.deteleNow = ''
        this.deleteNow = [id]
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteArticleAny(this.deleteNow).then((response) => {
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
            deleteArticleAny(this.ids).then((response) => {
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
        if (this.search.title || this.search.serTime || this.search.author) {
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
       * 自组件触发，刷新当前分页及内容
       * val 为当前页码数
       */
      changeNum(val) {
        this.page.currentPage = val
        this.fetchData()
      },
      addNews() {
        this.$router.push({ path: '/news/edit' })
      },
      editNews(data) {
        this.$router.push({ name: '编辑资讯', params: { id: data }})
      },
      /**
       * 时间组件更改触发查询时间值
       * val 为格式化之后的时间参数 yyyy-MM-dd - yyyy-MM-dd
       */
      changeHandler(val) {
        this.search.serTime = val
      }
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
