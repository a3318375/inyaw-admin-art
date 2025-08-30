import request from '@/utils/http'

export class BlogService {
  // 获取用户列表
  static blogPage(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Blog.ArticlePage>({
      url: '/blog/page',
      params
    })
  }
  static blogDetail(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Blog.ArticleInfo>({
      url: '/blog/info',
      params
    })
  }
  static blogAdd(params: Api.Blog.ArticleInfo) {
    return request.post<any>({
      url: '/blog/save',
      params
    })
  }
  static typeList(params?: Api.Blog.ArticleInfo) {
    return request.get<Api.Blog.TypeInfo>({
      url: '/type/list',
      params
    })
  }
}
