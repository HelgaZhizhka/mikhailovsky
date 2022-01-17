@extends('layouts.main')

@section('content')
    <div id="app">
        <nav>
            <ul>
                <li><router-link to="/about">About</router-link></li>

                <li>
                    <a href="{{$url.'admin'}}" class="link">Admin</a>
                </li>
            </ul>
        </nav>

        <router-view></router-view>
    </div>
