# TODO: #

1. Render a crown / second counter for king pieces.
2. Implement messaging.
3. Implement `Leave Game` and `Logout` options.
4. Update server to serve polyglot html5.
5. Implement login page which should display the leaderboard,
   the login button, then local play or remote play.

## SSL Certificate: ##

Generated using this guide: https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/

## To Start the Game: ##

1. Start the matchmaker: `gulp start:matchmaker`
2. Start the router: `gulp start:router`
3. Start the http server: `gulp start`

Leave game:
  Send GameOver message.
  Redirect to index.html.

Logout:
  Send GameOver message.
  Logout.
  Redireect to index.html.
