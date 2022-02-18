<template>
    <div class="page landing">
        <navbar
            :menu="menu"
            :decoration="'navbar_main'"></navbar>
        <sidebar :cdn-url="cdnUrl"
                 :url="url"></sidebar>
        <landing-video :cdn-url="cdnUrl"
                       :url="url"></landing-video>
        <div class="section section_promo">
            <ul class="list list_promo">
                <li>Святыни обители</li>
                <li>Раписание богослужений</li>
                <li>Молитвенное поминовение</li>
                <li>Вопросы священнику</li>
            </ul>

        </div>
        <div class="section section_bg section_news">
            <h2 class="section__heading">Новости и события</h2>
        </div>
        <div class="section section_bg section_news">
            <h2 class="section__heading">История монастыря</h2>
        </div>
    </div>
</template>

<script>
import Navbar from "./Navbar";
import LandingVideo from "./LandingVideo";
import Sidebar from "./Sidebar";

export default {
    name: "Landing",
    props: {
        cdnUrl: String,
        url: String
    },
    data: function () {
        return {
            menu: [],
        }
    },
    components: {
        Navbar,
        Sidebar,
        LandingVideo
    },
    created() {
        console.log('created from AdminHeader.vue')
        this.getMenu();
    },

    methods: {
        getMenu(){
            axios.get('/get-data').then(response=>{
                if (response.data.status === 'ok'){
                    console.log('успешно получили menu')
                    this.menu = response.data.menu;
                }
            });
        }
    }
}

</script>

