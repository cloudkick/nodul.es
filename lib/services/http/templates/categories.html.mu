{{> header }}

<h1>Modules by Category</h1>

<h3>Categories</h3>
<ul>
  {{#categories}}
    <li><a href="#{{name}}">{{name}}</a></li>
  {{/categories}}
</ul>

<dl class="categories">
  {{#categories}}
    <dt><a name="{{name}}"></a>{{name}}</dt>
    <dd>
      <ul>
      {{#projects}}
        <li><a href="/modules/{{_id}}">{{name}}</a></li>
      {{/projects}}
      </ul>
    </dd>
  {{/categories}}
</dl><!--/.categories-->

{{> footer }}
