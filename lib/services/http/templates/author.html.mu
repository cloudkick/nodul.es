{{> header }}

<div class="authors">
  {{#author}}
  <h1><img src="{{avatar_url}}"/> {{name}}</h1>
  <div class="newsitembody">
    <ul>
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </div>
  {{/author}}
</div>

{{> footer }}
