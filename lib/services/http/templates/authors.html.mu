{{> header }}

<h1>By Author</h1>

<div class="authors">
  {{#authors}}
  <div class="author">
  <h3 class="name"><a href="/authors/{{name}}">{{name}}</a></h3>
    <ul class="projects">
    {{#projects}}
      <li><a href="/modules/{{_id}}" alt="{{description}}">{{name}}</a></li>
    {{/projects}}
    </ul>
  </div><!--./author-->
  <hr class="clear">
  {{/authors}}
</div><!--./authors-->

{{> footer }}
