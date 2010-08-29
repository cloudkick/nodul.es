<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
<channel>
  <title>Latest modules</title>
  <link>http://nodul.es/modules/</link>
  <description>Latest NodeJS modules</description>
  <atom:link href="http://nodul.es/modules/feed.atom" rel="self"></atom:link>
  <language>en-us</language>
  {{#modules}}
    <item>
      <title>{{name}}</title>
      <link>http://nodul.es/modules/{{name}}</link>
      <description>{{description}}</description>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">{{author}}</dc:creator>
      <guid>http://nodul.es/modules/{{name}}</guid>
    </item>
  {{/modules}}
</channel>
</rss>
