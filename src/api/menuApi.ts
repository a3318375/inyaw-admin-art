import request from '@/utils/http'

export class MenuService {
  //菜单接口
  static getMenuList() {
    return request.get<Api.Menu.MenuList>({
      url: '/menu/findMenuList'
    })
  }
}
