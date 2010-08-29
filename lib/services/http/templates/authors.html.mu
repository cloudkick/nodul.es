{{> header }}

<h1>Hi, its the Nodul.es website!</h1>
<div class="authors">
  {{#authors}}
  <div class="newsitem">
  <h2 id="author_{{name}}">{{name}}</h2>
  <div class="newsitembody">
    <ul>
    {{#projects}}
      <li><a href="/module/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </div>
  </div>
  {{/authors}}
</div>

{{> footer }}
