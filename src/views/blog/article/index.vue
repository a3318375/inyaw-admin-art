<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refresh">
        <template #left>
          <ElButton @click="showDialog()">发布文章</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :table-config="{ rowKey: 'id' }"
        :layout="{ marginTop: 10 }"
        @row:selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { BlogService } from '@/api/blogApi'
  import { router } from '@/router'

  defineOptions({ name: 'BlogArticle' })

  type UserListItem = Api.User.UserListItem
  const { width } = useWindowSize()
  const { blogPage } = BlogService

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 用户状态配置
  const ARTICLE_STATUS_CONFIG = {
    true: { type: 'success' as const, text: '发布' },
    false: { type: 'warning' as const, text: '草稿' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      ARTICLE_STATUS_CONFIG[status as keyof typeof ARTICLE_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    tableData: data,
    isLoading: loading,
    paginationState: pagination,
    searchData: getDataByPage,
    resetSearch: resetSearchParams,
    onPageSizeChange: handleSizeChange,
    onCurrentPageChange: handleCurrentChange,
    refreshAll: refresh,
    refreshAfterCreate: refreshAfterAdd,
    refreshAfterUpdate: refreshAfterEdit,
    refreshAfterRemove: refreshAfterDelete
  } = useTable<UserListItem>({
    // 核心配置
    core: {
      apiFn: blogPage,
      apiParams: {
        pageNumber: 1,
        pageSize: 10,
        title: '',
        phone: '',
        address: undefined
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        // { type: 'expand' }, // 展开列
        {
          prop: 'title',
          label: '标题',
          width: 320
        },
        {
          prop: 'typeName',
          label: '分类',
          width: 80
        },
        {
          prop: 'summary',
          label: '分类'
        },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 120,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ],
      paginationKey: {
        current: 'pageNumber',
        size: 'pageSize'
      }
    },
    // 数据处理
    transform: {
      responseAdapter: (response) => {
        // 适配自定义响应格式
        return {
          records: response.records,
          total: response.totalRow,
          current: response.pageNumber,
          size: response.pageSize
        }
      }
    },
    // 性能优化
    performance: {
      enableCache: true, // 是否开启缓存
      cacheTime: 10 * 60 * 1000 // 缓存时间 10分钟
    },
    // 生命周期钩子
    hooks: {
      onError: (error) => ElMessage.error(error.message) // 错误处理
      // onSuccess: (data) => console.log('数据加载成功:', data), // 成功处理
      // onCacheHit: (data) => console.log('缓存命中:', data), // 缓存命中处理
      // resetFormCallback: () => console.log('重置表单')
    },
    // 调试配置
    debug: {
      enableLog: true // 是否开启日志
    }
  })

  /**
   * 显示用户弹窗
   */
  const showDialog = (row?: UserListItem): void => {
    router.push({ path: '/blog/article/publish', query: { id: row?.id } })
    // console.log('打开弹窗:', { type, row })
    // dialogType.value = type
    // currentUserData.value = row || {}
    // nextTick(() => {
    //   dialogVisible.value = true
    // })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('注销成功')
      refreshAfterDelete() // 智能删除后刷新
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      await (dialogType.value === 'add' ? refreshAfterAdd() : refreshAfterEdit())
      currentUserData.value = {}
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
