{{> header }}

<h1>Modules by Author</h1>

<ul class="authors">
  {{#authors}}
  <li class="author">
  <dt class="name"><h3><a href="/authors/{{name}}">{{name}}</a></h3></dt>
  <dd class="projects">
    <ul>
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </dd>
  </li><!--./author-->
  {{/authors}}
</ul><!--./authors-->

{{> footer }}
