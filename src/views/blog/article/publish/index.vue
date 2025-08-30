<template>
  <div class="article-edit">
    <div>
      <div class="editor-wrap">
        <!-- 文章标题、类型 -->
        <ElRow :gutter="10">
          <ElCol :span="18">
            <ElInput
              v-model.trim="articleName"
              placeholder="请输入文章标题（最多100个字符）"
              maxlength="100"
            />
          </ElCol>
          <ElCol :span="6">
            <ElSelect v-model="articleType" placeholder="请选择文章类型" filterable>
              <ElOption
                v-for="item in articleTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElCol>
        </ElRow>
        <ElRow style="margin-top: 15px">
          <ElCol :span="24">
            <ElInput v-model.trim="summary" placeholder="摘要" maxlength="200" />
          </ElCol>
        </ElRow>

        <!-- 富文本编辑器 -->
        <ArtMdEditor class="el-top" v-model="editorHtml" />

        <div class="form-wrap">
          <h2>发布设置</h2>
          <ElRow :gutter="10">
            <ElCol :span="6">
              <ElFormItem label="是否发布">
                <ElSwitch v-model="status" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="是否热门">
                <ElSwitch v-model="isHot" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="6">
              <ElFormItem label="是否打开评论">
                <ElSwitch v-model="isComment" />
              </ElFormItem>
            </ElCol>
          </ElRow>

          <div style="display: flex; justify-content: flex-end">
            <ElButton type="primary" @click="submit" style="width: 100px">
              {{ pageMode === PageModeEnum.Edit ? '保存' : '发布' }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="outline-wrap">
        <div class="item" v-for="(item, index) in outlineList" :key="index">
          <p :class="`level${item.level}`">{{ item.text }}</p>
        </div>
      </div> -->
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { PageModeEnum } from '@/enums/formEnum'
  import { useCommon } from '@/composables/useCommon'
  import { BlogService } from '@/api/blogApi'

  defineOptions({ name: 'ArticlePublish' })

  const route = useRoute()
  const articleId = route.query.id

  let pageMode: PageModeEnum = PageModeEnum.Add // 页面类型 新增 ｜ 编辑
  const articleName = ref('') // 文章标题
  const summary = ref('') // 文章标题
  const articleType = ref() // 文章类型
  const articleTypes = ref() // 类型列表
  const editorHtml = ref('') // 编辑器内容
  const status = ref(true) // 是否发布
  const isComment = ref(true) // 是否打开评论
  const isHot = ref(false) // 是否热门
  // const outlineList = ref()

  onMounted(() => {
    useCommon().scrollToTop()
    getArticleTypes()
    initPageMode()
  })

  // 初始化页面类型 新增 ｜ 编辑
  const initPageMode = () => {
    const { id } = route.query
    pageMode = id ? PageModeEnum.Edit : PageModeEnum.Add
    if (pageMode === PageModeEnum.Edit && id) {
      initEditArticle()
    }
  }

  // 初始化编辑文章的逻辑
  const initEditArticle = () => {
    getArticleDetail()
  }

  // 获取文章类型
  const getArticleTypes = async () => {
    try {
      articleTypes.value = await BlogService.typeList()
    } catch (error) {
      console.error('Error fetching JSON data:', error)
    }
    // try {
    //   const res = await ArticleService.getArticleTypes({})
    //   if (res.code === ApiStatus.success) {
    //     articleTypes.value = res.data
    //   }
    // } catch (err) { }
  }

  const getArticleDetail = async () => {
    // const res = await axios.get('https://www.qiniu.lingchen.kim/blog_list.json')
    //
    // if (res.data.code === ApiStatus.success) {
    //   let { title, blog_class, html_content } = res.data.data
    //   articleName.value = title
    //   articleType.value = Number(blog_class)
    //   editorHtml.value = html_content
    // }
    if (articleId) {
      const blogInfo = await BlogService.blogDetail({ id: articleId })
      if (blogInfo) {
        articleName.value = blogInfo.title
        editorHtml.value = blogInfo.context
        articleType.value = blogInfo.typeId
        summary.value = blogInfo.summary
      }
    }
  }

  // const getOutline = (content: string) => {
  //   const regex = /<h([1-3])>(.*?)<\/h\1>/g
  //   const headings = []
  //   let match

  //   while ((match = regex.exec(content)) !== null) {
  //     headings.push({ level: match[1], text: match[2] })
  //   }
  //   outlineList.value = headings
  // }

  // 提交
  const submit = () => {
    saveArticle()
  }

  // 格式化日期
  const formDate = (date: string | Date): string => {
    return useDateFormat(date, 'YYYY-MM-DD').value
  }

  // 验证输入
  const validateArticle = () => {
    if (!articleName.value) {
      ElMessage.error(`请输入文章标题`)
      return false
    }

    if (!articleType.value) {
      ElMessage.error(`请选择文章类型`)
      return false
    }

    if (editorHtml.value === '<p><br></p>') {
      ElMessage.error(`请输入文章内容`)
      return false
    }
    return true
  }

  // 添加文章
  const saveArticle = async () => {
    try {
      if (!validateArticle()) return

      const blogInfo = {
        title: articleName.value,
        summary: summary.value,
        isComment: isComment.value,
        isHot: isHot.value,
        status: status.value,
        typeId: articleType.value,
        context: editorHtml.value
      }
      if (pageMode === PageModeEnum.Edit) {
        blogInfo.id = articleId
      }
      console.log(1111, blogInfo)
      await BlogService.blogAdd(blogInfo)
    } catch (err) {
      console.error(err)
    }
  }
</script>

<style lang="scss" scoped>
  .article-edit {
    .editor-wrap {
      max-width: 1000px;
      margin: 20px auto;

      .el-top {
        margin-top: 10px;
      }

      .form-wrap {
        padding: 20px;
        margin-top: 20px;
        background-color: var(--art-main-bg-color);
        border: 1px solid var(--art-border-color);
        border-radius: calc(var(--custom-radius) / 2 + 2px) !important;

        h2 {
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 500;
        }
      }
    }

    .outline-wrap {
      box-sizing: border-box;
      width: 280px;
      padding: 20px;
      border: 1px solid #e3e3e3;
      border-radius: 8px;

      .item {
        p {
          height: 30px;
          font-size: 13px;
          line-height: 30px;
          cursor: pointer;
        }

        .level3 {
          padding-left: 10px;
        }
      }
    }

    .upload-container {
      .cover-uploader {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border-radius: 6px;
        transition: var(--el-transition-duration);

        &:hover {
          border-color: var(--el-color-primary);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 260px;
          height: 160px;
          border: 1px dashed #d9d9d9;
          border-radius: 6px;

          .upload-icon {
            font-size: 28px;
            color: #8c939d;
          }

          .upload-text {
            margin-top: 8px;
            font-size: 14px;
            color: #8c939d;
          }
        }

        .cover-image {
          display: block;
          width: 260px;
          height: 160px;
          object-fit: cover;
        }
      }

      .el-upload__tip {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    }
  }
</style>
