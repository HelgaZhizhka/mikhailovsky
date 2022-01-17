@extends('layouts.admin_layout')

@section('content')
    <div id="admin">
        <div class="page">
            <div class="page-main">

                <admin-header url="{{$url}}"></admin-header>

                <side-bar></side-bar>

                <router-view></router-view>

            </div>
        </div>
        <footer class="footer">
            <div class="container">
                <p class="text-center">
                    © 2022 Все права защищены.
                </p>
            </div>
        </footer>
    </div>
@endsection
