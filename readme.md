# TODO: #

1. Render a crown / second counter for king pieces.
2. Implement messaging.
3. Implement `Leave Game` and `Logout` options.
4. Implement matchmaker.
5. Update server to serve polyglot html5.
6. Implement a server to store the leaderboard.
7. Implement login page which should display the leaderboard,
   the login button, then local play or remote play.

## SSL Certificate: ##

Generated using this guide: https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/

Leave game:
  Send GameOver message.
  Redirect to index.html.

Logout:
  Send GameOver message.
  Logout.
  Redireect to index.html.
