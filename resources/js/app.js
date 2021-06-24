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

const app = new Vue({
    el: '#app',
    router,

    data(){
        return {

        }
    },

    created() {
        console.log('created from App');
    },
    mounted() {
        console.log('APP mounted.')
    },
    methods: {

    }
})
