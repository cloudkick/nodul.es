{{> header }}

<h1>Node.js Modules by Name</h1>
<div class="modules">
  <dl>
  {{#modules}}
  <dt><a href="/modules/{{_id}}"">{{name}}</a></dt>
  <dd>{{description}}</a></dd>
  {{/modules}}
  </dl>
</div><!--./modules-->

{{> footer }}
