/**
 * Renders "AskBro" with "Bro" in the brand red (#CC0000).
 * Use this wherever the product name appears as visible text.
 */
export default function BrandName({ className, style }) {
  return (
    <span className={className} style={style}>
      Ask<span style={{ color: '#CC0000' }}>Bro</span>
    </span>
  )
}
