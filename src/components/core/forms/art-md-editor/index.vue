<!-- WangEditor 富文本编辑器 插件地址：https://www.wangeditor.com/ -->
<template>
  <div class="editor-wrapper">
    <MdEditor v-model="modelValue" :customIcon="customIcon" />
  </div>
</template>

<script setup lang="ts">
  import '@wangeditor/editor/dist/css/style.css'
  import { CustomIcon, MdEditor } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'

  defineOptions({ name: 'ArtMdEditor' })

  const customIcon: CustomIcon = {
    bold: {
      component: `<i class='iconfont-sys'>&#xe630;</i>`
    }
  }
  const modelValue = defineModel<string>({ required: true })
</script>

<style lang="scss">
  @use './style';
</style>
