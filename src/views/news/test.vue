<template>    
  <div v-loading="vm.imageLoading" element-loading-text="请稍等，图片上传中">
    <quill-editor
      ref="newEditor"
      :options="newOption"
      style="height: 200px; margin-bottom: 54px"
      v-model="editorContent"  
      @change="editorChange">
    </quill-editor>
    <form action="" method="post" enctype="multipart/form-data" id="uploadFormMulti">
      <input style="display: none" :id="uniqueId" type="file" name="avator" multiple accept="image/jpg,image/jpeg,image/png,image/gif" @change="uploadImg('uploadFormMulti')">
    </form>
  </div>
</template>    
<script>
  import Quill from 'quill'
  import ImageResize from 'quill-image-resize-module'
  Quill.register('modules/imageResize', ImageResize)
  export default {
    data() {
      return {
        vm: {
          imageLoading: false
        },
        editorContent: '我是测试文章内容',
        newOption: [
              ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],               // custom button values
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
              [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
              [{ 'direction': 'rtl' }],                         // text direction
              [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['clean']
        ]
      }
    },
    mounted() {
      var vm = this
      var imgHandler = async function(image) {
        vm.addImgRange = vm.$refs.newEditor.quill.getSelection()
        if (image) {
          var fileInput = document.getElementById(vm.uniqueId) // 隐藏的file文本ID
          fileInput.click() // 加一个触发事件
        }
      }
      vm.$refs.newEditor.quill.getModule('toolbar').addHandler('image', imgHandler)
    },
    methods: {
      imageLoading: function() {
        return false
      },
      uploadImg: async function(id) {
        var vm = this
        vm.imageLoading = true
        var formData = new FormData($('#' + id)[0])
        try {
          const url = await vm.uploadImgReq(formData)// 自定义的图片上传函数
          if (url != null && url.length > 0) {
            var value = url
            vm.addImgRange = vm.$refs.newEditor.quill.getSelection()
            value = value.indexOf('http') != -1 ? value : 'http:' + value
            vm.$refs.newEditor.quill.insertEmbed(vm.addImgRange != null ? vm.addImgRange.index : 0, 'image', value, Quill.sources.USER)
          } else {
            vm.$message.warning('图片增加失败')
          }
          document.getElementById(vm.uniqueId).value = ''
        } catch ({ message: msg }) {
          document.getElementById(vm.uniqueId).value = ''
          vm.$message.warning(msg)
        }
        vm.imageLoading = false
      },
      editorChange() {}
    }

}
</script>

