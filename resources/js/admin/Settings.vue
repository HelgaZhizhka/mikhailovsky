<template>
    <div class="app-content">
        <div class="page-header">
            <h4 class="page-title">Настройки</h4>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Admin Accounts</h3>
                    </div>
                    <div class="card-body">
                        <h3>Admins</h3>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                <tr>
                                    <th>admin_id</th>
                                    <th>name</th>
                                    <th>email</th>
                                    <th>created</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="admin in admins">
                                    <td>{{admin.id}}</td>
                                    <td>
                                        <strong class="link text-green" >{{admin.name}}</strong>
                                    </td>
                                    <td>{{admin.email}}</td>
                                    <td>{{ (new Date(admin.created_at).toLocaleString())}}</td>

                                    <td class="td_center">
                                    <span class="text-red link" @click="deleteAdmin(admin)" v-if="+admin.id !== +currentAdmin.id"><i class="fe fe-trash"></i></span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Admin name</label>
                            <input class="form-control" id="new_admin_name" type="text" placeholder="Admin name" v-model="newAdminName">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Admin email</label>
                            <input class="form-control" id="new_email" type="text" placeholder="Admin email" v-model="newAdminEmail">
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-success" type="submit" @click="createNewAdminAccount">Create admin account</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Settings",
    props: ['currentAdmin'],
    data: function () {
        return {
            admins: [],
            newAdminName: null,
            newAdminEmail: null,
        }
    },
    created() {
        this.initSettings();
    },
    methods: {
        deleteAdmin(admin){
            console.log('delete admin...')
            console.log(admin.name)
            let conf = confirm('Ты уверен что хочешь удалить аккаунт администратора '+admin.name+ '?')
            if (conf){
                axios.post('/admin/delete-admin-account', {admin: admin}).then(response => {
                    if (response.data.status === 'ok'){
                        console.log("аккаунт админа удален")
                        this.admins = this.admins.filter(adm=>{
                            return adm.id !== admin.id
                        })
                    }else{
                        alert('Ошибка при удалении аккаунта...')
                    }
                })
                    .catch(e => {
                        console.log(e);
                    })
            }
        },
        initSettings(){
            axios.get('/admin/init-settings').then(response=>{
                if (response.data.status === 'ok'){
                    console.log('успешно получили menu')
                    this.admins = response.data.admins;
                }
            });
        },
        createNewAdminAccount(){
            console.log('createNewAdminAccount')
            if (this.newAdminEmail && this.newAdminName){
                let conf = confirm('Ты уверен в своих действиях?')
                if (conf){
                    axios.post('/admin/create-new-admin-account', {
                        email: this.newAdminEmail,
                        name: this.newAdminName
                    }).then(response => {
                        if (response.data.status === 'ok'){
                            console.log("новый аккаунт успешно создан")
                            this.admins.push(response.data.admin)
                            this.newAdminName = ''
                            this.newAdminEmail = ''
                        }
                    })
                        .catch(e => {
                            console.log(e);
                        })
                }
            }else alert("некорректные данные")
        },
    }
}
</script>

<style scoped>

</style>
