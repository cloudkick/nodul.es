{{> header }}

<h1>Categories page</h1>
<div class="categories">
  {{#categories}}
  <div class="catitem">
  <h2>{{name}}</h2>
  <div class="catitembody">
    <ul>
    {{#projects}}
      <li>{{name}}</li>
    {{/projects}}
    </ul>
  </div>
  </div>
  {{/categories}}
</div>

{{> footer }}
