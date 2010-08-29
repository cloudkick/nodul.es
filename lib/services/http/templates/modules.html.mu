{{> header }}

<h1>Node.js Modules</h1>
<div class="modules">
  <ul>
  {{#modules}}
  <li><a href="/modules/{{_id}}"">{{name}}</a> - {{description}}</a></li>
  {{/modules}}
  </ul>
</div><!--./modules-->

{{> footer }}
