/**
 * Renders one or more JSON-LD structured data blocks as <script> tags.
 * Pass a single object or an array of objects.
 */
export default function JsonLd({ data }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
