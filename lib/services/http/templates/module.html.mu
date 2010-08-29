{{> header }}

{{#module}}
<div class="module">
  <h1><span class="dark">Module:</span> {{name}}</h1>
  <div class="desc">{{description}}</div>

  <div class="authors inline-block">
    <h3>Authors:</h3>
    <ul>
    {{#maintainers}}
    <li><a href="/authors/{{name}}"><img src="{{avatar_url}}"/>{{name}}</a></li>
    {{/maintainers}}
    </ul>
  </div><!--/.authors-->

  <div class="dependencies inline-block">
    <h3>Dependencies:</h3>
    <ul>
    {{#dependencies}}
    <li><a href="/modules/{{name}}">{{name}}</a> {{version}}</li>
    {{/dependencies}}
    </ul>
  </div>

  <div class="reverse_dependencies inline-block">
    <h3>Modules depending on this package:</h3>
    <ul>
    {{#reverse_dependencies}}
    <li><a href="/modules/{{name}}">{{name}}</a> {{version}}</li>
    {{/reverse_dependencies}}
    </ul>
  </div>

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
