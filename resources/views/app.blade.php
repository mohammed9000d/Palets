<!doctype html>
<html lang="en">
  <head>
    <title>Palets - Art Gallery Platform</title>
    <link rel="icon" href="/favicon.svg" />
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
    
    @vite(['resources/css/app.css'])
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    
    @vite(['resources/js/index.jsx'])
  </body>
</html>
