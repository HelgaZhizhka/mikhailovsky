<template>
    <div class="app-content">
        <div class="page-header">
            <h4 class="page-title">Панель администрирования</h4>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Список разделов</h3>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover card-table table-stripped table-nowrpap">
                            <thead>
                            <tr>
                                <th>Раздел</th>
                                <th>Количество материала</th>
                                <th>Действия</th>

                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Видео</td>
                                <td>12</td>
                                <td><a href="" class="btn btn-sm btn-primary">Перейти</a></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: "Dashboard",
    created() {
        console.log('created from Dashboard.vue')
    }
}
</script>

<style scoped>

</style>
