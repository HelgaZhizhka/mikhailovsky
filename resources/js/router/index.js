import VueRouter from "vue-router"
import Landing from "../components/Landing";
import About from "../components/About";
import Dashboard from "../admin/Dashboard";
import Articles from "../admin/Articles";
import Medias from "../admin/Medias";
import Settings from "../admin/Settings";


const routes = [
    {
        path: '/',
        component: Landing,
        name: "landing"
    },
    {
        path: '/about',
        component: About,
        name: "about"
    },
    {
        path: '/admin',
        component: Dashboard,
        name: "dashboard"
    },
    {
        path: '/admin/articles',
        component: Articles,
        name: "articles"
    },
    {
        path: '/admin/medias',
        component: Medias,
        name: "medias"
    },
    {
        path: '/admin/settings',
        component: Settings,
        name: "settings"
    },
]

const router = new VueRouter({
    routes,
    mode: "history"
})

export default router;

