//  配置路由
import { createRouter, createWebHistory } from "vue-router";

// 定义一个变量
let router = createRouter({
    // 路由历史
    history: createWebHistory(),

    // 配置路由，是一个数组，里面可以配置多个路由
    routes: [
        {
            // 路由路径
            path: '/',
            // 路由路径所对应的页面
            component : () => import('../view/LoginView.vue')
        },
        {
            path: '/dashboard',
            component : () => import('../view/DashboardView.vue'),
            // 子路由
            children : [
                {
                    // 子路由中的路径不需要以 "/" 开头
                    path: 'users',
                    component : () => import('../view/UsersView.vue')
                },

                {
                    // :id 为动态路由
                    path: 'users/:id',
                    component : () => import('../view/UsersDetailView.vue')
                },

                {
                    // 子路由中的路径不需要以 "/" 开头
                    path: 'pictures',
                    component : () => import('../view/PicturesView.vue')
                },

                {
                    // 子路由中的路径不需要以 "/" 开头
                    path: 'userPic',
                    component : () => import('../view/UserPicView.vue')
                },
            ]
        }
    ]
})

export default router