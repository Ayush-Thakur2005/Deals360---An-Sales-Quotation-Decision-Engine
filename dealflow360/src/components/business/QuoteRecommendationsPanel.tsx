import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { fetchRecommendations } from '../../lib/quotes-api'
import type { ApiQuoteLine, ApiRecommendation } from '../../lib/types'

interface SourceProductRecs {
  productId: string
  productName: string
  loading: boolean
  recommendations: ApiRecommendation[]
  allAlreadyOnQuote: boolean
  fetchFailed: boolean
}

interface Props {
  lines: ApiQuoteLine[]
  quoteProductIds: Set<string>
  canAddLine: boolean
  isDraft: boolean
  actionLoading: boolean
  onAddRecommendation: (rec: ApiRecommendation) => void
}

export function QuoteRecommendationsPanel({
  lines,
  quoteProductIds,
  canAddLine,
  isDraft,
  actionLoading,
  onAddRecommendation,
}: Props) {
  const [byProduct, setByProduct] = useState<SourceProductRecs[]>([])

  useEffect(() => {
    const sources = [...new Map(lines.map((l) => [l.productId, l.product?.name ?? 'Product'])).entries()]

    if (sources.length === 0) {
      setByProduct([])
      return
    }

    setByProduct(
      sources.map(([productId, productName]) => ({
        productId,
        productName,
        loading: true,
        recommendations: [],
        allAlreadyOnQuote: false,
        fetchFailed: false,
      })),
    )

    for (const [productId, productName] of sources) {
      fetchRecommendations(productId)
        .then((res) => {
          const filtered = res.recommendations.filter((r) => !quoteProductIds.has(r.productId))
          setByProduct((prev) =>
            prev.map((row) =>
              row.productId === productId
                ? {
                    ...row,
                    loading: false,
                    recommendations: filtered,
                    allAlreadyOnQuote: res.recommendations.length > 0 && filtered.length === 0,
                    fetchFailed: false,
                  }
                : row,
            ),
          )
        })
        .catch(() => {
          setByProduct((prev) =>
            prev.map((row) =>
              row.productId === productId
                ? { ...row, loading: false, recommendations: [], fetchFailed: true }
                : row,
            ),
          )
        })
    }
  }, [lines, quoteProductIds])

  const anyLoading = byProduct.some((p) => p.loading)
  const hasVisibleRecs = byProduct.some((p) => p.recommendations.length > 0)

  return (
    <Card>
      <CardHeader
        title="Recommendations / Upsell"
        subtitle="Co-purchase suggestions from confirmed deal history (lift > 1)"
        action={<Sparkles className="w-4 h-4 text-[var(--color-brand)] shrink-0" />}
      />

      {lines.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Add a product to see recommendations</p>
      ) : anyLoading && !hasVisibleRecs ? (
        <p className="text-sm text-[var(--color-muted)]">Loading recommendations…</p>
      ) : (
        <div className="space-y-4">
          {byProduct.map((source) => (
            <div key={source.productId}>
              <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">
                For {source.productName}
              </p>

              {source.loading ? (
                <p className="text-sm text-[var(--color-muted)]">Loading…</p>
              ) : source.fetchFailed ? (
                <p className="text-sm text-[var(--color-danger)]">Could not load recommendations</p>
              ) : source.allAlreadyOnQuote ? (
                <p className="text-sm text-[var(--color-muted)]">Suggested products are already on this quote</p>
              ) : source.recommendations.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No strong recommendations for this product</p>
              ) : (
                <div className="space-y-2">
                  {source.recommendations.map((rec) => (
                    <div
                      key={`${source.productId}-${rec.productId}`}
                      className="p-3 border border-[var(--color-border)] rounded-md text-sm"
                    >
                      <p className="font-medium">{rec.productName}</p>
                      <p className="text-[var(--color-muted)] text-xs mt-1">
                        Lift score: <span className="font-medium text-[var(--color-text)]">{rec.liftScore}</span>
                      </p>
                      {rec.promotionTag && (
                        <span className="inline-block mt-1 text-xs font-medium text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-2 py-0.5 rounded">
                          {rec.promotionTag}
                        </span>
                      )}
                      {isDraft && canAddLine && (
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => onAddRecommendation(rec)}
                          disabled={actionLoading}
                        >
                          Add to Quote
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
