<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" type="image/png" href="{{ asset('images/faviconiemsztum.png') }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        <meta property="og:title" content="IEM Sztum - Platforma E-sportowa">
        <meta property="og:description" content="Dołącz do rozgrywek, stwórz lobby i graj!">
        <meta property="og:image" content="{{ url('images/social-preview.jpg') }}">
        <meta property="og:url" content="https://iemsztum.pl">
        <meta property="og:type" content="website">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
