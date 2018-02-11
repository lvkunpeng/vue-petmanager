
<template>
  <div class="app-container">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="ruleForm.title"></el-input>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover">
        <el-upload
          class="upload-demo"
          action="http://139.219.71.184/pic/upload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          :before-upload="beforeUpload"
          :on-success="successUpload"
          name="bc_cover"
          list-type="picture">
          <!-- <img  v-show="coverJudge" style="display: block;z-index: 999" :src="coverValue" alt=""> -->
          <el-button size="small" type="primary" :disabled="uploadBtn">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">推荐上传图片比例为长：宽=16:9 （例：1600px:900px;3200px:1800px px为像素）</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="编写者" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="ruleForm.nowTime"
          type="datetime"
          :readonly=true
          placeholder="当前时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="文章内容">
        <div>
         <tinymce :height="200" v-model="content"></tinymce>
        </div>
        <div class="editor-content" v-html="content"></div>
      </el-form-item>
      <el-form-item>
        <el-button type="success" :disabled="submitBtn" @click="saveArticle('ruleForm')">确认</el-button>
        <el-button @click="rollBack()">取消</el-button>
      </el-form-item>
    </el-form>
  
  </div>
</template>

<script>
import { getDetail, saveArticle } from '@/api/new'
import Tinymce from '@/components/Tinymce'
export default {
  name: 'tinymce-demo',
  components: { Tinymce },
  data() {
    return {
      list: null,
      listLoading: true,
        // 上传按钮状态
      uploadBtn: false,
        // 提交文章按钮状态
      submitBtn: false,
        // 编辑文章封面回显内容
        // coverValue: '',
        // 编辑文章封面是否显示
        // coverJudge: false,
      content: '请在此处写入文章内容',
      ruleForm: {
        title: '',
        name: '',
          // 文章创建时间
        nowTime: null
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
            max: 50,
            message: '长度在 3 到 50 个字符',
            trigger: 'blur'
          }
        ]
      },
      fileList: []
    }
  },
  created() {
    this.typeChoose()
  },
  methods: {
    /**
       * 判断是否为编辑文章
       */
    typeChoose() {
          // 新建文章内容
      if (JSON.stringify(this.$route.params) == '{}') {
        this.getNowTime()
      } else {
            // 编辑文章内容
        getDetail(this.$route.params).then(response => {
          this.ruleForm.title = response.title
          this.ruleForm.name = response.author
            // this.coverValue = response.cover
          this.fileList.push({
            name: 'name',
            url: response.cover
          })
            // this.coverJudge = true
          this.ruleForm.nowTime = response.updateTime
          this.content = response.content
        })
      }
    },
      /**
       * 上传图片一张之后给按钮禁用
       */
    handleRemove(file, fileList) {
      if (this.fileList.length == 1) {
        this.fileList = []
        this.uploadBtn = false
      }
    },
    handlePreview(file) {
      console.log(file)
    },
      /**
       * 上传图片之前判断是否一个图片
       */
    beforeUpload(file) {
      if (this.fileList.length >= 1) {
        this.$message({
          type: 'error',
          message: '最多上传1张图片',
          duration: 1000
        })
        return false
      }
    },
      /**
       * 成功上传图片给列表赋值,并在编辑模式下隐藏原封面
       */
    successUpload(response, file, fileList) {
      this.fileList.push({
        name: response.fileName,
        url: response.url
      })
      this.uploadBtn = true
        // this.coverJudge = false
    },
      /**
       * 从服务器上获取一个时间并将此时间返回
       * 目前暂时获得的本地时间
       */
    getNowTime() {
      this.ruleForm.nowTime = new Date()
    },
      /**
       * 路由指向并且推入history栈当中
       */
    rollBack() {
      this.$confirm('此操作将返回文章列表且不会保存文章内容, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.push({ path: '/news/list' })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    saveArticle(formName) {
      if (this.fileList.length !== 1 || !this.content) {
        this.$message({
          showClose: true,
          type: 'info',
          message: '请保证封面图片已经上传且正文内容存在'
        })
      } else {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const articleForm = {
              flag: true,
              title: this.ruleForm.title,
              author: this.ruleForm.name,
              nowTime: this.ruleForm.nowTime,
              cover: this.fileList[0].url,
              content: this.content,
              id: this.$route.params.id
            }
            saveArticle(articleForm)
            this.$router.push({ name: '资讯列表' })
            this.$message({
              showClose: true,
              message: '文章内容已经成功保存',
              type: 'success'
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.editor-content{
  margin-top: 20px;
}
</style>
