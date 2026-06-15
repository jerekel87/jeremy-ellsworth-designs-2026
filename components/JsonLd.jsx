/* Server component that prints a JSON-LD graph into the static HTML so non-JS
   AI crawlers (and search engines) can read the entity data without executing
   the app. Renders nothing visible. */

export default function JsonLd({ data }) {
  if (!data) return null;
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.filter(Boolean).map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}
