{{> header }}

<div class="authors">
  {{#author}}
  <h1><img class="floatR border" style="position:relative; left:15px;" src="{{avatar_url}}"/> {{name}}</h1>
  <h3>Projects</h3>
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
