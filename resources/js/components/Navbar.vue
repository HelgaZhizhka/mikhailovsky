<template>
    <nav class="navbar" :class="decoration">
        <ul class="menu">
            <li class="menu__item" :class="{'is-parent' : item.submenu.length}" v-for="item in menu">
                <span class="menu__title">{{ item.title }}</span>
                <ul class="menu menu_sub" v-if="item.submenu">
                    <li class="menu__item" v-for="subItem in item.submenu">
                        <a class="menu__link" href="">{{ subItem.title }}</a></li>
                </ul>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: "Navbar",
    props: {
        decoration: String,
        menu: Array
    }
}
</script>

<style scoped>

</style>
