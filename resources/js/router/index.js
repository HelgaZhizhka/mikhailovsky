import VueRouter from "vue-router"
import Landing from "../components/Landing";
import About from "../components/About";
import Dashboard from "../admin/Dashboard";
import First from "../admin/First";
import Second from "../admin/Second";


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
        path: '/admin/first',
        component: First,
        name: "first"
    },
    {
        path: '/admin/second',
        component: Second,
        name: "second"
    },
]

const router = new VueRouter({
    routes,
    mode: "history"
})

export default router;

