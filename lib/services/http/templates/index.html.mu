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

{{> footer }}
