<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3">
        <el-button type="warning" @click="deteleAll()">批量禁用</el-button>
      </el-col>
      <el-col :span="4">
        <el-input placeholder="昵称" v-model="search.nickname"></el-input>
      </el-col>
      <el-col :span="4">
        <el-input placeholder="手机号" v-model="search.mobile"></el-input>
      </el-col>
      <el-col :span="3" class="listright">
        <el-button type="primary" icon="search" @click="inquire()">搜索</el-button>
      </el-col>
    </el-row>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row
              @selection-change="handleSelectionChange">
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column align="center" label='编号' width="70">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center">
        <template scope="scope">
          {{scope.row.nickname}}
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="125" align="center">
        <template scope="scope">
          <span>{{scope.row.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="70" align="center">
        <template scope="scope">
          {{scope.row.sex | sexChose}}
        </template>
      </el-table-column>
      <el-table-column label="年龄" width="80" align="center">
        <template scope="scope">
          {{scope.row.birthday | dateSm | dateBir}}岁
        </template>
      </el-table-column>
      <el-table-column label="城市" width="80" align="center">
        <template scope="scope">
          {{scope.row.city}}
        </template>
      </el-table-column>
      <el-table-column label="喜欢的宠物" width="100" align="center">
        <template scope="scope">
          {{scope.row.favorites}}
        </template>
      </el-table-column>
      <el-table-column label="养宠的年限" width="80" align="center">
        <template scope="scope">
          {{scope.row.petLife}}年
        </template>
      </el-table-column>
      <el-table-column label="个人说明" align="center">
        <template scope="scope">
          {{scope.row.signature}}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template scope="scope">
          <el-tag :type="scope.row.enabled | statusFilter">{{scope.row.enabled | statusChose}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column  label="最后登录时间" width="200" align="center">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.lastLoginTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100" fixed="right">
        <template scope="scope">
          <el-button @click="getOne(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)" v-if="scope.row.enabled == 1">禁用</el-button>
          <el-button type="text" size="small" @click="enableOne(scope.$index, scope.row.id)" v-else>恢复</el-button>          
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
    <el-dialog title="用户详情" :visible.sync="dialogFormVisible">
      <el-form class="small-space" label-position="left" label-width="100px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="昵称">
          <el-input v-model="detail.nickname" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="detail.mobile" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="性别">
          <el-input :value="detail.sex | sexChose" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="城市">
          <el-input v-model="detail.city" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="喜欢的宠物">
          <el-input v-model="detail.favorites" :readonly=true ></el-input>
        </el-form-item>

        <el-form-item label="养宠年限">
          <!--计算属性在input上可以通过:value指令的方式使用-->
          <el-input  :readonly=true :value="detail.updateTime| dateBir | addYear"></el-input>
        </el-form-item>

        <el-form-item label="个人说明">
          <el-input v-model="detail.signature" :readonly=true type="textarea"></el-input>
        </el-form-item>

        <el-form-item label="用户状态">
          <!--<el-tag :type="detail.enabled | statusFilter">{{detail.enabled | statusChose}}</el-tag>-->
          <el-switch v-model="detail.enabled" on-text="正常" off-text="禁用" :on-value="1" :off-value="0" on-color="#20A0FF" off-color="#C0CCDA"></el-switch>
        </el-form-item>
        <el-form-item label="注册时间">
          {{detail.updateTime | dateAll}}
        </el-form-item>
        <el-form-item label="最后登录时间">
          {{detail.updateTime | dateAll}}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" >取消</el-button>
        <el-button @click="inDetail(detail)" type="primary">确认</el-button>
      </div>
    </el-dialog>
    <!-- 分页组件 -->
    <paging :page-total='page.total' @changeNum="changeNum"></paging> 

  </div>

</template>

<script>
  import { getList, deleteAny, enableUser } from '@/api/user'
  import Paging from '../common/paging.vue'
  export default {
    components: { Paging },
    data() {
      return {
        value: true,
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        search: {
          mobile: null,
          nickname: null
        },
        deleteNow: [],
        enableNow: [],
        ids: [],
        detail: {
          id: '',
          nickname: '',
          mobile: '',
          sex: '',
          birthday: '',
          city: '',
          favorites: '',
          petLife: '',
          signature: '',
          enabled: '',
          registTime: '',
          lastLoginTime: ''
        },
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        currentPage1: 1,
        pickerOptions2: {
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
       * 过滤器：内容标签颜色
       */
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          0: 'danger'
        }
        return statusMap[status]
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
      },
      /**
       * 过滤器：状态返回中文提示
       */
      statusChose(type) {
        const typeMap = {
          1: '正常',
          0: '禁用'
        }
        return typeMap[type]
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
       * 过滤器：生日
       */
      dateBir(birth) {
        var year = 1000 * 60 * 60 * 24 * 365
        var now = new Date()
        var birthday = new Date(birth)
        var age = parseInt((now - birthday) / year)
        return age
      },
      /**
       * 过滤器：加年
       */
      addYear(data) {
        return data + '年'
      }
    },
    // 构建时方法
    created() {
      this.fetchData()
    },
    methods: {
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
          'mobile': this.search.mobile,
          'nickname': this.search.nickname
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
       * 模糊查询
       */
      inquire() {
        if (this.search.nickname || this.search.mobile) {
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
       * 恢复一个
       */
      enableOne(index, id) {
        this.deteleNow = ''
        this.deleteNow = [id]
        enableUser(this.deleteNow).then((response) => {
          if (response === 0) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '恢复成功'
            })
            this.deteleNow = []
          }
        })
        // this.$confirm('是否将该用户恢复？', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
  
        // }).catch(() => {
        //   this.deteleNow = []
        //   this.$message({
        //     type: 'info',
        //     message: '已取消恢复'
        //   })
        // })
      },
      /**
       * 禁用一个
       */
      deleteOne(index, id) {
        this.deteleNow = ''
        this.deleteNow = [id]
        deleteAny(this.deleteNow).then((response) => {
          if (response === 0) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '禁用成功'
            })
            this.deteleNow = []
          }
        })
        // this.$confirm('是否将该用户禁用？', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
  
        // }).catch(() => {
        //   this.deteleNow = []
        //   this.$message({
        //     type: 'info',
        //     message: '已取消禁用'
        //   })
        // })
      },
      /**
       * 详情中禁用一个用户
       */
      inDetail(data) {
        data.enabled ? this.enableOne(data, data.id) : this.deleteOne(data, data.id)
        this.dialogFormVisible = false
      },
      /**
       * 禁用全部
       */
      deteleAll() {
        if (this.ids.length) {
          this.$confirm('是否将这些用户禁用？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteAny(this.ids).then((response) => {
              if (response === 0) {
                this.fetchData()
                this.$message({
                  type: 'success',
                  message: '禁用成功'
                })
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消禁用'
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
       * 自组件触发，刷新当前分页及内容
       * val 为当前页码数
       */
      changeNum(val) {
        this.page.currentPage = val
        this.fetchData()
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
