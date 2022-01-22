<template>
    <div>
        <h1>Landing</h1>
        <h1>Menu</h1>
        <ul>
            <li v-for="item in menu">
                <h4>{{ item.title }}</h4>
                <ul v-if="item.submenu">
                    <li v-for="subItem in item.submenu">{{ subItem.title }}</li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: "Landing",
    props: [],
    data: function () {
        return {
            menu: [],
        }
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

