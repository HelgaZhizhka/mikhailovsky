@extends('layouts.main')

@section('content')
    <div id="app">
        <nav>
            <ul>
                <li><router-link to="/">Home</router-link></li>
                <li><router-link to="/about">About</router-link></li>
            </ul>
        </nav>

        <router-view
        ></router-view>
    </div>
