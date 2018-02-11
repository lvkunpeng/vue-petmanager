<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="昵称" v-model="search.nickname"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="手机号" v-model="search.mobile"></el-input>
      </el-col>
      <el-col :span="3">
        <div class="block">
          <el-date-picker
            v-model="addTime"
            type="daterange"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="反馈时间"
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
      <el-table-column align="center" label='编号' width="95">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="100" align="center">
        <template scope="scope">
          {{scope.row.user.nickname}}
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="125" align="center">
        <template scope="scope">
          <span>{{scope.row.user.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈内容"  align="center">
        <template scope="scope">
          {{scope.row.content | lineClamp}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="反馈时间" width="200">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈状态" width="110" align="center">
        <template scope="scope">
          <el-tag :type="scope.row.isRead | statusFilter">{{scope.row.isRead | statusChose}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template scope="scope">
          <el-button @click="getOne(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
       <el-form-item label="昵称">
          <el-input v-model="detail.user.nickname" :readonly=true ></el-input>
      </el-form-item>
      <el-form-item label="手机号">
          <el-input v-model="detail.user.mobile" :readonly=true ></el-input>
      </el-form-item>
      <el-form-item label="反馈时间">
           {{detail.updateTime | dateAll}}
      </el-form-item>
         <el-form-item label="反馈内容">
          <el-input v-model="detail.content" :readonly=true type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="affirm()" type="primary">确认</el-button>
      </div>
    </el-dialog>
     <!--分页器-->
   <paging :page-total='page.total' @changeNum="changeNum"></paging>

  </div>

</template>

<script>
  // 引入分页组件
  import Paging from '../common/paging.vue'
  import { getList, toRead, deleteFb } from '@/api/system'
  export default {
            // 引入需要的组件
    components: { Paging },
    data() {
      return {
        search: {
          mobile: null,
          nickname: null,
          serTime: null
        },
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        currentPage1: 1,
        detail: {
          'user': {
            mobile: '',
            nickname: ''
          },
          'mobile': '1881345678',
          'updateTime': '2014-04-01 07:35:52',
          'content': "<div>圆圆是一只英短，太爱掉毛了！</div><img src='https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3983874076,300668939&fm=27&gp=0.jpg' alt=''>"
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
        addTime: ''
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          0: 'danger'
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
        return value.length > 10 ? value.slice(0, 10) + '...' : value
      },
       /**
       * 过滤器：状态返回中文提示
       */
      statusChose(type) {
        const typeMap = {
          1: '已读',
          0: '未读'
        }
        return typeMap[type]
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
        var index = (this.page.currentPage - 1) * 10
        var size = this.page.pageSize
        this.listLoading = true
        const pageData = {
          'timerange': this.search.serTime,
          'user.mobile': this.search.mobile,
          '_index': index,
          '_size': size,
          'user.nickname': this.search.nickname
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
       * 自组件触发，刷新当前分页及内容
       * val 为当前页码数
       */
      changeNum(val) {
        this.page.currentPage = val
        this.fetchData()
      },
       /**
       * 查看一条表格信息详情
       */
      getOne(data) {
        if (data.isRead === 0) {
          toRead(data.id)
        }
        this.listLoading = true
        this.detail = data
        this.dialogFormVisible = true
        this.listLoading = false
      },
      /** @augments
       * 确认后刷新列表状态
       */
      affirm() {
        this.fetchData()
        this.dialogFormVisible = false
      },
       /**
       * 模糊查询
       */
      inquire() {
        if (this.search.mobile || this.search.nickname || this.search.serTime) {
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
        this.deteleNow = ''
        this.deleteNow = [id]
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteFb(this.deleteNow).then((response) => {
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
            deleteFb(this.ids).then((response) => {
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
  .listright{
    float: right;
  }

</style>
