require('./bootstrap');
import Vue from 'vue'
import VueRouter from "vue-router"
import router from "./router"
import VueMq from 'vue-mq';


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
    created(){
        console.log('created from admin.js')
    },
})
