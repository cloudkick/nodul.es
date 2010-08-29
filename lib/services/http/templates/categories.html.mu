{{> header }}

<h1>Categories</h1>
<div class="categories">
  {{#categories}}
  <div class="cat">
    <h3>{{name}}</h3>
    <div class="catitem">
      <ul>
      {{#projects}}
        <li>{{name}}</li>
      {{/projects}}
      </ul>
    </div><!--/.catitem-->
  </div><!--/.cat-->
  {{/categories}}
</div><!--/.categories-->

{{> footer }}
