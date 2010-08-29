{{> header }}

{{#module}}
<h1>{{name}}</h1>
{{/module}}
possible variables:
<pre><code>{{debug_plaintext}}<code></pre>

Files:
{{#files}}
<ul>
<li><a href="/source/????/{{name}}">{{name}}</a></li>
</ul>
{{/files}}
{{> footer }}
