<template>
  <div class="app-container">
    <el-row :gutter="10" class="toplist">
      <el-col :span="3">
        <el-button type="danger" @click="deteleAll()">批量删除</el-button>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="宠物名" v-model="search.nickName"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="用户名" v-model="search.master"></el-input>
      </el-col>
      <el-col :span="3">
        <el-select v-model="search.type" clearable placeholder="内容格式">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      </el-col>
      <el-col :span="3">
        <div class="block">
         <el-date-picker
            v-model="addTime"
            type="daterange"
            format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="创建时间"
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
      <el-table-column align="center" label='编号' width="95">
        <template scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="日记内容" align="center">
        <template scope="scope">
          {{scope.row.content}}
        </template>
      </el-table-column>
      <el-table-column label="宠物名" min-width="110" align="center">
        <template scope="scope">
          <div v-if="scope.row.petList">
            <span  v-for="onePet in scope.row.petList" style="margin-right:10px">{{onePet.nickname}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="110" align="center">
        <template scope="scope">
          {{scope.row.user.nickname}}
        </template>
      </el-table-column>
      <el-table-column label="内容格式" width="110" align="center">
        <template scope="scope">
          <el-tag :type="scope.row.type | statusFilter">{{scope.row.type | typeChose}}</el-tag>
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
          <el-button @click="getOne(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small" @click="deleteOne(scope.$index, scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--弹框表格-->
    <el-dialog title="查看日志" :visible.sync="dialogFormVisible">
      <el-form class="small-space" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="用户名">
           <el-input v-model="detail.user.nickname" :readonly=true ></el-input>
        </el-form-item>
        <!-- <el-form-item label="宠物名">
            <el-input v-model="pet.nickname" :readonly=true v-for="pet in detail.petList"></el-input>
        </el-form-item> -->
        <el-form-item label="创建时间">
          {{detail.updateTime | dateAll}}
        </el-form-item>
        <el-form-item label="内容">
          <ul v-if="detail.type == 1" class="list">
            <li v-for="item in detail.petDiaryPicList">
               <img :src="item.url" alt="" style="width:100%">
            </li>
          </ul>
          <video v-else style="width:100%" controls autobuffer>
             <source :src="detail.videoUrl" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
             </source>
          </video>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="日记内容详情" name="1">
              <div>{{detail.content}}</div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" type="primary">确认</el-button>
      </div>
    </el-dialog>
    <paging :page-total='page.total' @changeNum="changeNum" ref="Paging"></paging> 
  </div>

</template>

<script>
  import Paging from '../common/paging.vue'
  import { getList, deleteAny } from '@/api/diary'

  export default {
    components: { Paging },
    data() {
      return {
        activeNames: 1,
        search: {
          nickName: null,
          master: null,
          serTime: null,
          type: null
        },
        options: [{
          value: 2,
          label: '视频'
        }, {
          value: 1,
          label: '图片'
        }],
        addTime: null,
        deleteNow: [],
        ids: [],
        page: {
          total: 100,
          currentPage: 1,
          pageSize: 10
        },
        detail: {
          'user': '布鲁斯韦恩',
          'pet': '圆圆',
          'time': '2014-04-01 07:35:52',
          'content': "<div>圆圆是一只英短，太爱掉毛了！</div><img src='https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3983874076,300668939&fm=27&gp=0.jpg' alt=''>"
        },
        list: null,
        listLoading: true,
        dialogFormVisible: false,
        multipleSelection: [],
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
       * 过滤器：内容标签颜色
       */
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          2: 'gray'
        }
        return statusMap[status]
      },
      /**
       * 过滤器：内容类型返回中文提示
       */
      typeChose(type) {
        const typeMap = {
          1: '图片',
          2: '视频'
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
          'pet_nickname': this.search.nickName,
          'user_nickname': this.search.master,
          'searchDate': this.search.serTime,
          'type': this.search.type
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
       * 查看某一条数据的详情 index的值带有本条数据的所有内容
       */
      getOne(index) {
        console.log(index)
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
       * 模糊查询
       */
      inquire() {
        if (this.search.nickName || this.search.master || this.search.serTime || this.search.type) {
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
  .list{
    list-style: none;
    padding:0
  }
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
