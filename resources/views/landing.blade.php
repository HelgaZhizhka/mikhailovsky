@extends('layouts.main')

@section('content')
    <div class="wrapper" id="app">
        <nav class="hide">
            <ul>
                <li><router-link to="/about">About</router-link></li>

                <li>
                    <a href="{{$url.'admin'}}" class="link">Admin</a>
                </li>
            </ul>
        </nav>

        <router-view
            :cdn-url="cdnUrl"
            :url="url"></router-view>
        <footer class="footer">
            <span>2022</span>
        </footer>
    </div>
