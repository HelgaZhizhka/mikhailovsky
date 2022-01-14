import VueRouter from "vue-router"
import Home from "../components/Main";
import About from "../components/About";

const routes = [
    {
        path: '/',
        component: Home,
        name: "home"
    },
    {
        path: '/about',
        component: About,
        name: "about"
    },
]

const router = new VueRouter({
    routes,
    mode: "history"
})

export default router;

