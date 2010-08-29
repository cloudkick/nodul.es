{{> header }}

<div class="news-wrapper border">
  <div class="news">
    {{#news}}
    <div class="newsitem">
    <h3>{{title}}</h3>
    <div class="newsitembody">
      {{{body}}}
    </div>
    </div>
    {{/news}}
  </div>
</div><!--/.news-wrapper-->

<h1>Nodul.es: The Node.js Module Index</h1>

<div class="description">
Nodul.es indexes the <a href="http://github.com/isaacs/npm">NPM</a> package
registry to make it easy to find user created modules for <a
href="http://github.com/ry/node">Node.js</a>. To have your module listed on
Nodul.es simply upload it to the NPM registry using the NPM command line
utility.
</div>

<h2>New Node.js Modules</h2>
<div class="newmods">
  <ul>
  {{#newmods}}
  <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
  {{/newmods}}
  </ul>
</div>


{{> footer }}
