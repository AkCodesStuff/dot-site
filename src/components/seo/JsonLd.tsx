/**
 * Renders a JSON-LD structured-data block.
 *
 * Usage:
 *   <JsonLd data={organizationSchema()} />
 *   <JsonLd data={[websiteSchema(), breadcrumbSchema(trail)]} />
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is escaped for the `</script>` edge case.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, "\u003c"),
          }}
        />
      ))}
    </>
  );
}
