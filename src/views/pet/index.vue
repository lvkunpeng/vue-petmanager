<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="宠物昵称" v-model="search.nickName"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="铲屎官" v-model="search.master"></el-input>
      </el-col>
      <el-col :span="3">
        <div class="block">
         <el-date-picker
            v-model="addTime"
            type="daterange"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="添加时间"
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
          <!--{{scope.$index}}-->
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="宠物昵称" width="100" align="center">
        <template scope="scope">
          {{scope.row.nickname}}
        </template>
      </el-table-column>
      <el-table-column label="铲屎官" width="100" align="center">
        <template scope="scope">
          <span>{{scope.row.master}}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="65" align="center">
        <template scope="scope">
          {{scope.row.sex | sexChose}}
        </template>
      </el-table-column>
      <el-table-column label="城市" width="65" align="center">
        <template scope="scope">
          {{scope.row.city}}
        </template>
      </el-table-column>
      <el-table-column label="宠物品种" width="100" align="center">
        <template scope="scope">
          {{scope.row.petCategory.name}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="宠物生日" width="130">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.birthday| dateSm}}</span>
        </template>
      </el-table-column>
      <el-table-column label="宠物介绍" align="center" min-width="130">
        <template scope="scope">
         {{scope.row.description | lineClamp}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="添加时间" width="190">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template scope="scope">
          <el-button @click="getOne(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
    <el-dialog title="查看宠物" :visible.sync="dialogFormVisible" size="small">
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="宠物昵称">
          <el-input v-model="detail.nickname" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="铲屎官">
          <el-input v-model="detail.master" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="性别">
          <el-input :value="detail.sex | sexChose" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="城市">
          <el-input v-model="detail.city" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="宠物品种">
          <el-input v-model="detail.petCategory.name" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="宠物生日">
          <!--计算属性在input上可以通过:value指令的方式使用-->
          <el-input  :readonly=true :value="detail.updateTime| dateAll"></el-input>
        </el-form-item>

        <el-form-item label="宠物介绍">
          <el-input v-model="detail.description" :readonly=true type="textarea"></el-input>
        </el-form-item>

        <el-form-item label="添加时间">
          {{detail.updateTime | dateAll}}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" type="primary">确认</el-button>
      </div>
    </el-dialog>
    <!-- 分页组件 -->
    <paging :page-total='page.total' @changeNum="changeNum"></paging> 
  </div>

</template>

<script>
  // 引入分页组件
  import Paging from '../common/paging.vue'
  import { getList, deleteAny } from '@/api/pet'
  export default {
    // 引入需要的组件
    components: { Paging },
    data() {
      return {
        search: {
          nickName: null,
          master: null,
          serTime: null
        },
        addTime: null,
        deleteNow: [],
        ids: [],
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
        detail: {
          nickname: '',
          master: '',
          sex: '',
          city: '',
          petCategory: {
            name: ''
          },
          birthday: '',
          description: '',
          updateTime: ''
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
        value3: null
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
        if (value) {
          return value.length > 10 ? value.slice(0, 10) + '...' : value
        }
      },
       /**
       * 过滤器：性别返回中文提示
       */
      sexChose(type) {
        const typeMap = {
          0: '男',
          1: '女'
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
          '_index': index,
          '_size': size,
          'pet_nickname': this.search.nickName,
          'user_nickname': this.search.master,
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
       * 查看一条表格信息详情
       */
      getOne(index) {
        this.listLoading = true
        this.detail = index
        this.dialogFormVisible = true
        this.listLoading = false
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
          deleteAny(this.deleteNow).then((response) => {
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
            deleteAny(this.ids).then((response) => {
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
        if (this.search.nickName || this.search.master || this.search.serTime) {
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

</style>
