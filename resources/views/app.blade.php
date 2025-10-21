<!doctype html>
<html lang="en">
  <head>
    <title>Palets - Art Gallery Platform</title>
    <!-- Default favicon - will be replaced by JavaScript if custom favicon is set -->
    <link rel="icon" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    
    <!-- Meta Tags-->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2296f3" />
    <meta name="title" content="Palets - Art Gallery Platform" />
    <meta
      name="description"
      content="Discover and purchase beautiful artworks from talented artists around the world."
    />
    <meta
      name="keywords"
      content="art gallery, artwork, artists, paintings, sculptures, art marketplace"
    />
    <meta name="author" content="Palets" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Cache Control - Prevent caching of HTML page -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    @vite('resources/css/app.css')
    @vite('resources/js/index.jsx')
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
