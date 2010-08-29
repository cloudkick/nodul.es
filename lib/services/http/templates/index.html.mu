{{> header }}

<h1>Hi, its the Nodul.es website!</h1>
<div class="news">
  {{#news}}
  <div class="newsitem">
  <h2>{{title}}</h2>
  <div class="newsitembody">
    {{body}}
  </div>
  </div>
  {{/news}}
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
