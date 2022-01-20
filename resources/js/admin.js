require('./bootstrap');
import Vue from 'vue'
import VueRouter from "vue-router"
import router from "./router"
import VueMq from 'vue-mq';
import AdminHeader from "./admin/AdminHeader";
import SideBar from "./admin/SideBar";
Vue
    .use(VueRouter)
    .use(VueMq, {
        breakpoints: {
            tablet: 992,
            laptop: 1280,
            desktop: Infinity
        }
    })

const admin = new Vue({
    el: '#admin',
    router,

    components: {
        AdminHeader, SideBar
    },

    data: function () {
        return {
            showSidebar: false
        }
    },

    created(){
        console.log('created from admin.js')
    },
    methods: {
        openSidebar() {
            this.showSidebar = true
        },
        closeSidebar() {
            this.showSidebar = false
        },
    }
})
