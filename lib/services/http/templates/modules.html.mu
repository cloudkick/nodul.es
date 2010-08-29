{{> header }}

<h2>Node.js Modules</h2>
<div class="modules">
  <ul>
  {{#modules}}
  <li><a href="/modules/{{_id}}"">{{name}}</a> - {{description}}</a></li>
  {{/modules}}
  </ul>
</div>

{{> footer }}
