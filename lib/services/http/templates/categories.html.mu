{{> header }}

<h1>Modules by Category</h1>
<div class="categories">
  {{#categories}}
  <div class="cat">
    <h3>{{name}}</h3>
    <div class="catitem">
      <ul>
      {{#projects}}
        <li><a href="/modules/{{_id}}">{{name}}</a></li>
      {{/projects}}
      </ul>
    </div><!--/.catitem-->
  </div><!--/.cat-->
  {{/categories}}
</div><!--/.categories-->

{{> footer }}
