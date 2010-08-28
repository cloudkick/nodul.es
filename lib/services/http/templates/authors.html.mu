{{> header }}

<h1>Hi, its the Nodul.es website!</h1>
<div class="authors">
  {{#authors}}
  <div class="newsitem">
  <h2>{{name}}</h2>
  <div class="newsitembody">
    <ul>
    {{#projects}}
      <li>{{name}}</li>
    {{/projects}}
    </ul>
  </div>
  </div>
  {{/authors}}
</div>

{{> footer }}
