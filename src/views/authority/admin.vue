<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="2" class="btn">
        <el-button type="warning" @click="deteleAll()">批量禁用</el-button>
      </el-col>
      <el-col :span="3" class="btn">
        <el-button type="success" @click="addAdmin()">添加管理员</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="登录名" v-model="search.nickname"></el-input>
      </el-col>
      <el-col :span="3">
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
      <el-table-column align="center" label='编号' width="65">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
        <el-table-column align="center" label='登录名'>
        <template scope="scope">
          {{scope.row.nickname}}
        </template>
      </el-table-column>
      <el-table-column label="姓名"  align="center">
        <template scope="scope">
          {{scope.row.realname}}
        </template>
      </el-table-column>
      <el-table-column label="联系方式"  align="center" min-width="125">
        <template scope="scope">
          {{scope.row.mobile}}
        </template>
      </el-table-column>
      <el-table-column label="邮箱"  align="center" min-width="120">
        <template scope="scope">
          {{scope.row.email}}
        </template>
      </el-table-column>
      <el-table-column label="角色"  align="center">
        <template scope="scope">
          {{scope.row.role.name}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="最后登录时间" width="190">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.lastLoginTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template scope="scope">
          <el-tag :type="scope.row.enabled | statusFilter">{{scope.row.enabled | statusChose}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template scope="scope">
          <el-button @click="getOne(scope.row)" type="text" size="small">编辑</el-button>
           <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)" v-if="scope.row.enabled == 1">禁用</el-button>
          <el-button type="text" size="small" @click="enableOne(scope.$index, scope.row.id)" v-else>恢复</el-button>         
          <!-- <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
     <!--弹框表格-->
    <el-dialog title="管理员管理" :visible.sync="dialogFormVisible">
      <el-form class="small-space" label-position="left" label-width="100px" style='width: 80%; margin-left:50px;'>
        <el-form-item label="登录名">
          <el-input v-model="detail.nickname"></el-input>
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="detail.realname"  ></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="detail.roleId" placeholder="请选择管理员角色">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="detail.mobile"  ></el-input>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="detail.email"  ></el-input>
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="detail.password"  ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <!--<el-tag :type="detail.enabled | statusFilter">{{detail.enabled | statusChose}}</el-tag>-->
          <el-switch v-model="detail.enabled" on-text="正常" off-text="禁用" :on-value="1" :off-value="0" on-color="#20A0FF" off-color="#C0CCDA"></el-switch>
        </el-form-item>

        <el-form-item label="最后登录时间" v-if="this.detail.lastLoginTime">
          {{detail.lastLoginTime | dateAll}}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" >取消</el-button>
        <el-button @click="inDetail(detail)" type="primary">确认</el-button>
      </div>
    </el-dialog>
    <!--分页器-->
   <paging :page-total='page.total' @changeNum="changeNum"></paging> 
  </div>

</template>

<script>
  // 引入分页组件
  import Paging from '../common/paging.vue'
  import { getList, deleteAny, enabledAny, getRoleList, addAdmin, editAdmin } from '@/api/authority'
  export default {
        // 引入需要的组件
    components: { Paging },
    data() {
      return {
        search: {
          nickname: null,
          mobile: null,
          type: null
        },
        list: null,
        listLoading: true,
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        options: [],
        ids: [],
        deleteNow: [],
        dialogFormVisible: false,
        dialogVisible: false,
        multipleSelection: [],
        uploadBtn: false,
        nowTime: null,
        currentPage1: 1,
        detail: {
          id: '',
          roleId: '',
          nickname: '',
          realname: '',
          mobile: '',
          email: '',
          password: '',
          enabled: 1,
          lastLoginTime: ''
        }
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
      },
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
       * 过滤器：状态返回中文提示
       */
      statusChose(type) {
        const typeMap = {
          1: '正常',
          0: '禁用'
        }
        return typeMap[type]
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
          'nickname': this.search.nickname,
          'mobile': this.search.mobile
        }
        getRoleList().then(response => {
          this.options = response.records
        })
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
        this.$confirm('确定要将该管理员禁用吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAny(this.deleteNow).then((response) => {
            if (response === 0) {
              this.$message({
                type: 'success',
                message: '禁用成功'
              })
              this.deteleNow = []
              this.fetchData()
            }
          })
        }).catch(() => {
          this.deteleNow = []
          this.$message({
            type: 'info',
            message: '已取消禁用'
          })
        })
      },
      /**
       * 批量删除
       */
      deteleAll() {
        if (this.ids.length) {
          this.$confirm('确定要禁用这些管理员吗？', '提示', {
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
      enableOne(data, index) {
        enabledAny(index).then((response) => {
          this.fetchData()
        })
      },
      /**
       * 模糊查询
       */
      inquire() {
        if (this.search.mobile || this.search.nickname) {
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
      inDetail(data) {
        if (!data.id) {
          if (data.roleId) {
            addAdmin(data).then(
              this.$message({
                type: 'success',
                message: '添加成功'
              })
              )
            this.fetchData()
            this.dialogFormVisible = false
            this.detail = {
              nickname: '',
              realname: '',
              roleId: '',
              mobile: '',
              email: '',
              password: '',
              enabled: 1,
              lastLoginTime: ''
            }
          } else {
            this.$message({
              type: 'warning',
              message: '请选择一个角色'
            })
          }
        } else {
          const val = {}
          val.nickname = data.nickname
          val.realname = data.realname
          val.mobile = data.mobile
          val.roleId = data.roleId
          val.id = data.id
          val.email = data.email
          val.password = data.password
          val.enabled = data.enabled
          editAdmin(val).then(
            this.$message({
              type: 'success',
              message: '编辑成功'
            })
          )
          this.dialogFormVisible = false
        }
      },
      addAdmin() {
        this.detail = {
          nickname: '',
          realname: '',
          roleId: '',
          mobile: '',
          email: '',
          password: '',
          enabled: 1,
          lastLoginTime: ''
        }
        this.dialogFormVisible = true
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
