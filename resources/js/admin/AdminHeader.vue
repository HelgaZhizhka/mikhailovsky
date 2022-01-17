<template>
    <div>
        <div class="header app-header" ref="header">
            <div class="container-fluid">
                <div class="d-flex header__wrapper">

                    <div class="d-flex ml-auto">
                        <div class="bg-red-light">
                        <a :href="url">Mikhailovsky</a>
                    </div>
                        <div class="dropdown d-md-flex header-settings">
                        <span class="nav-link" data-toggle="dropdown">
                            <span class="avatar brround cover-image mb-0 ml-0">Y</span>
                        </span>
                            <div class="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                <div class="drop-heading text-center border-bottom pb-3">
                                    <h5 class="text-dark mb-1">Yuri</h5>
                                </div>
                                <a class="dropdown-item" href=""><span @click.prevent="logout">Logout</span></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminHeader",
    props: ['url'],
    data: function () {
        return {

        }
    },
    created() {
        console.log('created from AdminHeader.vue')
    },
    methods: {
        logout(){
            console.log("logout user")
            axios.post('/logout')
                .then(response => {
                    console.log('успех logout')
                    window.location.href = this.url;
                })
                .catch(e => {
                    console.log(e);
                })
        }
    }
}
</script>

<style scoped>

</style>
