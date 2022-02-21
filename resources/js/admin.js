require('./bootstrap');
import Vue from 'vue'
import VueRouter from "vue-router"
import router from "./router"
import VueMq from 'vue-mq';
import AdminHeader from "./admin/AdminHeader";
import SideBar from "./admin/SideBar";

Object.defineProperty(Vue.prototype,"$bus",{
    get: function() {
        return this.$root.bus;
    }
});

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
            bus: new Vue({}),
            showSidebar: false,
            currentAdmin: null,
        }
    },

    created(){
        console.log('created from admin.js')
        this.initAdminPanel();
    },
    methods: {
        initAdminPanel(){
            axios.get('/admin/init-admin').then(response=>{
                if (response.data.status === 'ok'){
                    console.log('init successful')
                    this.currentAdmin = response.data.currentAdmin;
                }
            });
        },
        openSidebar() {
            this.showSidebar = true
        },
        closeSidebar() {
            this.showSidebar = false
        },
    }
})
