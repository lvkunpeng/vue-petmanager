<template>
<!-- 分页通用子组件 -->
    <div class="block pagelist">
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page= page.currentPage
        :page-sizes= page.pageSize
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total= pageTotal>
        </el-pagination>
    </div>
</template>

<script>
export default {
  name: 'Paging',
  props: ['pageTotal'],
  data() {
    return {
      page: {
        size: 100,
        total: 100,
        pageSize: [10],
        currentPage: 1
      }
    }
  },
  methods: {
    /**
    * 当前页currentPage改变的时候触发的方法
    * val 为当前页码数
    */
    handleCurrentChange(val) {
      this.$emit('changeNum', val)
    },
    handleSizeChange() {

    }
  }
}
</script>


<style rel="stylesheet/scss" lang="scss" scoped>

</style>
