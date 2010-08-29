{{> header }}

<h1>By Author</h1>

<ul class="authors">
  {{#authors}}
  <li class="author">
  <div class="name"><a href="/authors/{{name}}">{{name}}</a></div>
    <ul class="projects">
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </li><!--./author-->
  {{/authors}}
</ul><!--./authors-->

{{> footer }}
