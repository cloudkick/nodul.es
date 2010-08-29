{{> header }}

<h1>Modules by Category</h1>
<dl class="categories">
  {{#categories}}
    <dt>{{name}}</dt>
    <dl>
      <ul>
      {{#projects}}
        <li>{{name}}</li>
      {{/projects}}
      </ul>
    </dl>
  {{/categories}}
</div><!--/.categories-->

{{> footer }}
