<template>
  <div class="app-container">

    <el-row :gutter="10" class="toplist">
      <el-col :span="3" class="listleft">
        <el-button type="success" @click="addrole()">添加角色</el-button>
      </el-col>
      <!-- <el-col :span="3">
        <el-input placeholder="角色名称" v-model="this.search.name"></el-input>
      </el-col>
      <el-col :span="3" class="listright">
        <el-button type="primary" icon="search" @click="inquire()">搜索</el-button>
      </el-col> -->
    </el-row>

    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row>
      <el-table-column align="center" label='编号' width="95">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" align="center">
        <template scope="scope">
          {{scope.row.name}}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="添加时间" width="200">
        <template scope="scope">
          <i class="el-icon-time"></i>
          <span>{{scope.row.updateTime | dateAll}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
          <el-button @click="allot(scope.row)" type="text" size="small">分配权限</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格:管理员名字-->
      <el-dialog title="查看" :visible.sync="dialogFormVisible" size="small">
        <el-form class="small-space" label-position="left" label-width="70px">
           <el-form-item label="标题">
            <el-input v-model="detail.newName" ></el-input>
          </el-form-item>
        </el-form>
         <div slot="footer" class="dialog-footer">
          <el-button type="" size="small" @click="dialogFormVisible = false">取消</el-button>
          <el-button type="success" size="small" @click="add()">确定</el-button>
        </div>
      </el-dialog>
    <!--弹框表格:管理员权限-->
    <el-dialog title="查看" :visible.sync="dialogFormVisible_list" size="small">
        <el-tree
       :data="treeData"
       show-checkbox
       default-expand-all
       node-key="id"
       ref="tree"
       highlight-current
       :props="defaultProps">
      </el-tree>
       <div slot="footer" class="dialog-footer">
          <el-button type="" size="small" @click="dialogFormVisible_list = false">取消</el-button>
          <el-button type="success" size="small" @click="changeRole()">确定</el-button>
        </div>
    </el-dialog>
    
       <!-- 分页组件 -->
    <paging :page-total='page.total' @changeNum="changeNum"></paging> 
  </div>

</template>

<script>
 // 引入分页组件
  import Paging from '../common/paging.vue'
  import { getRoleList, newRole, editRoleName, deleteRole, changeRoleList, getRoleTree } from '@/api/authority'

  export default {
     // 引入需要的组件
    components: { Paging },
    data() {
      return {
        search: {
          name: ''
        },
        roleId: null,
        treeData: [
          {
            label: '数据统计',
            children: [
              {
                id: 300,
                label: '用户统计'
              }, {
                id: 301,
                label: '宠物统计'
              }, {
                id: 302,
                label: '日记统计'
              }
            ]
          },
          {
            id: 293,
            label: '日记管理'
          },
          {
            id: 294,
            label: '宠物管理'
          },
          {
            label: '资讯管理',
            children: [
              {
                id: 296,
                label: '资讯列表'
              }, {
                id: 297,
                label: '评论管理'
              }, {
                id: 298,
                label: '轮播图管理'
              }
            ]
          },
          {
            id: 299,
            label: '用户管理'
          },
          {
            label: '权限管理',
            children: [
              {
                id: 304,
                label: '管理员管理'
              }, {
                id: 305,
                label: '角色管理'
              }
            ]
          },
          {
            label: '系统管理',
            children: [
              {
                id: 307,
                label: '反馈列表'
              }, {
                id: 308,
                label: '关于我们'
              }, {
                id: 309,
                label: '知识卡片'
              }
            ]
          }
        ],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        dialogFormVisible_list: false,
        dialogVisible: false,
        multipleSelection: [],
        currentPage1: 1,
        detail: {
          newName: '',
          id: ''
        },
        deleteNow: [],
        tree: ''
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
          'name': this.search.name
        }
        getRoleList(pageData).then(response => {
          this.list = response.records
          this.page.total = response.total
          this.listLoading = false
        }).catch(
          // 错误捕获
        )
      },
      addrole() {
        this.detail = {
          newName: '',
          id: ''
        }
        this.dialogFormVisible = true
      },
      add() {
        if (this.detail.id) {
          const val = {
            id: this.detail.id,
            name: this.detail.newName
          }
          editRoleName(val).then(
            response => {
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
            }
          )
          this.fetchData()
          this.dialogFormVisible = false
        } else {
          if (this.detail.newName) {
            newRole(this.detail.newName).then(response => {
              this.$message({
                type: 'success',
                message: '添加成功!'
              })
              this.fetchData()
              this.dialogFormVisible = false
            }).catch(
        )
          } else {
            this.$message({
              type: 'warning',
              message: '请输入正确的角色名称!'
            })
          }
        }
      },
      handleClick(data) {
        this.dialogFormVisible = true
        this.detail.newName = data.name
        this.detail.id = data.id
      },
      /**
       * 删除一个
       */
      deleteOne(index, id) {
        this.$confirm('信息删除后不能找回，确定要删除这条信息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRole(id).then((response) => {
            if (response === 0) {
              this.fetchData()
              this.$message({
                type: 'success',
                message: '删除成功'
              })
            } else if (response === 400) {
              this.$message({
                type: 'warning',
                message: '改角色下仍有用户不能删除'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
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
       * 获取当前用户的权限列表
       * val 为当前页码数
       */
      allot(data) {
        this.roleId = data.id
        getRoleTree(data.id).then(response => {
          const arr = response.map(function(index, item) {
            if (index.enabled == 1) {
              return index.id
            }
          })
          this.$refs.tree.setCheckedKeys(arr)
        })
        this.dialogFormVisible_list = true
      },
      changeRole() {
        const list = this.$refs.tree.getCheckedKeys().join(',')
        const role = {
          'id': this.roleId,
          'rights': list
        }
        changeRoleList(role).then(
          response => {
            this.dialogFormVisible_list = false
            this.$message({
              type: 'success',
              message: '修改成功'
            })
          }
        ).catch()
      },
      /**
       * 模糊查询
       */
      inquire() {
        if (this.search.name) {
          this.fetchData()
        } else {
          this.$message({
            message: '缺少查询选项默认显示所有数据',
            type: 'warning'
          })
          this.fetchData()
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

  .listleft {
    float: left;
  }

</style>
