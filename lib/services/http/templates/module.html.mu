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
    <li><a href="/authors/{{name}}">{{name}}</a></li>
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
    <h3>Dependent modules:</h3>
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

  <hr>

  Files:
  <ul>
    {{#files}}
      <li><a href="/source/{{modname}}/{{name}}">{{name}}</a></li>
    {{/files}}
  </ul>
</div><!--/.module-->
{{> footer }}
