{{> header }}

{{#module}}
<h1>{{name}}</h1>
<div class="authors">
<ul>
{{#maintainers}}
<li><a href="/authors/{{name}}"><img src="{{avatar_url}}"/>{{name}}</a>
{{/maintainers}}
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
