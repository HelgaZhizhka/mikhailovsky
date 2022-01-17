@extends('layouts.admin')

@section('content')
    <div id="admin">
        <div class="page">
            <div class="page-main">
                <div class="app-content">
                    <div class="container-fluid main-content">

                    </div>
                </div>
            </div>
            <footer class="footer">
                <div class="container">
                    <p class="text-center">
                        © 2021 Все права защищены.
                    </p>
                </div>
            </footer>
        </div>
        <router-view></router-view>
    </div>
@endsection
