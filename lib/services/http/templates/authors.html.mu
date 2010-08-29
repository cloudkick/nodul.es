{{> header }}

<h1>Modules by Author</h1>

<dl class="authors">
  {{#authors}}
  <dt class="name"><a href="/authors/{{name}}">{{name}}</a></dt>
  <dd class="projects">
    <ul>
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </dd>
  {{/authors}}
</dl><!--./authors-->

{{> footer }}
