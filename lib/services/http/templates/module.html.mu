{{> header }}

{{#module}}
<div class="module">
  <h1><span class="dark">Module:</span> {{name}}</h1>
  <div class="desc">{{description}}</div>

  <hr>

  <div class="authors mod-block">
    <h3>Authors:</h3>
    <ul>
    {{#maintainers}}
    <li><a href="/authors/{{name}}">{{name}}</a> <a href="/authors/{{name}}" style="text-decoration:none; position:relative; top:8px;"><img class="border" height="20" src="{{avatar_url}}"/></a></li>
    {{/maintainers}}
    </ul>
  </div><!--/.authors-->

  <div class="dependencies mod-block">
    <h3>Dependencies:</h3>
    <ul>
      {{#dependencies}}
      <li><a href="/modules/{{name}}">{{name}}</a> {{version}}</li>
      {{/dependencies}}
    </ul>
  </div>

  <div class="reverse_dependencies mod-block">
    <h3>Modules depending on this package:</h3>
    <ul>
      {{#reverse_dependencies}}
      <li><a href="/modules/{{name}}">{{name}}</a> {{version}}</li>
      {{/reverse_dependencies}}
    </ul>
  </div>

  <hr>

  {{/module}}

  possible variables:
  <pre><code>{{debug_plaintext}}<code></pre>

  Files:
  {{#files}}
  <ul>
  <li><a href="/source/{{modname}}/{{name}}">{{name}}</a></li>
  </ul>
  {{/files}}
</div><!--/.module-->
{{> footer }}
