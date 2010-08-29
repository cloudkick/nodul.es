{{> header }}

{{#module}}
<h1>{{name}}</h1>
<div class="desc">{{description}}</div>
<div class="authors">
Authors:
<ul>
{{#maintainers}}
<li><a href="/authors/{{name}}"><img src="{{avatar_url}}"/>{{name}}</a></li>
{{/maintainers}}
</ul>
</div>
<div class="dependencies">
Dependencies:
<ul>
{{#dependencies}}
<li><a href="/modules/{{name}}">{{name}}</a> {{version}}</li>
{{/dependencies}}
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
{{> footer }}
