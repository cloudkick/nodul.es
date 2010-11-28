{{> header }}


<div class="module">
	{{#module}}
  <h1><span class="dark">Module:</span> {{name}} <span class="tiny" style="position:relative; left:10px; top:-20px;">(v{{latest_version}})</span></h1>
  <!--<div class="desc">{{description}}</div>-->
	{{/module}}
	<div class="file_path">
		<strong>File:</strong> {{#module}}<a href="/modules/{{_id}}">{{name}}</a>{{/module}}{{#path}}/<a href="{{url}}">{{name}}</a>{{/path}}
	</div>
  <hr>
	<div class="file-content">
		{{#info}}
			{{#code}}
				<pre><code class="prettyprint linenums">{{content}}</code></pre>
			{{/code}}
			{{#text}}
				<pre class="text">{{content}}</pre>
			{{/text}}
			{{#markup}}
				<iframe width="100%" height="100%" src="{{content}}"></iframe>
			{{/markup}}
			<ul>
			{{#files}}
				<li><a href="{{url}}">{{name}}</a></li>
			{{/files}}
			</ul>
		{{/info}}
	</div>
</div>

<pre>{{debug}}</pre>
{{> footer }}