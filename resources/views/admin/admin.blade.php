@extends('layouts.admin_layout')

@section('content')
    <div id="admin">
        <div class="page">
            <div class="page-main">
                <!-- HEADER -->
                <admin-header
                    url="{{$url}}"
                    @open="openSidebar"></admin-header>
                <!-- HEADER END -->
                <!-- Sidebar menu-->
                <side-bar
                    :show="showSidebar"
                    @close="closeSidebar"></side-bar>
                <!-- Sidebar menu end-->
                <!-- CONTAINER -->
                <router-view></router-view>
                <!-- CONTAINER end-->
            </div>
        </div>
        <!-- FOOTEr -->
        <footer class="footer">
            <div class="container">
                <p class="text-center">
                    © 2022 Все права защищены.
                    <a href="{{$url}}">Перейти на сайт</a>
                </p>
            </div>
        </footer>
        <!-- FOOTER END -->
    </div>
@endsection
