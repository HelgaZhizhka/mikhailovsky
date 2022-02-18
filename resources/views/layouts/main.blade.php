<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" id="csrf_token" content="{{ csrf_token() }}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Mobile web app title">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="address=no">
    <title>Свято-Архангело-Михайловский женский монастырь</title>
    <meta name="description" content="Свято-Архангело-Михайловский женский монастырь">
    <meta name="keywords" content="Свято-Архангело-Михайловский женский монастырь">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@400;700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/stylesheet.css">
    <link rel="stylesheet" href="{{ mix('assets/css/app.css') }}">
    <script src="{{ mix('js/manifest.js') }}" defer></script>
    <script src="{{ mix('js/vendor.js') }}" defer></script>
    <script src="{{ mix('js/app.js') }}" defer></script>
    <script>
        window.myUrl = {!! json_encode(config('app.url')) !!};
        {{--window.cdnUrl = {!! json_encode(config('app.cdn_url')) !!};--}}
        window.version = {!! json_encode(config('app.version')) !!};
        window.environment = {!! json_encode(config('app.env')) !!};
    </script>
</head>
<body>
    @yield('content')
</body>
</html>
