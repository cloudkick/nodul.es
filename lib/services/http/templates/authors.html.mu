{{> header }}

<div class="authors">
  {{#authors}}
  <div class="newsitem">
  <h2><a href="/authors/{{name}}">{{name}}</a></h2>
  <div class="newsitembody">
    <ul>
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </div>
  </div>
  {{/authors}}
</div>

{{> footer }}
