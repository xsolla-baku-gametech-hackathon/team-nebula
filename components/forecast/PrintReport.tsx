import type { Snapshot } from "@/lib/types";

function money(value: number | null): string {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function count(value: number | null): string {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US").format(value);
}

export function PrintReport({ snapshot }: { snapshot: Snapshot }) {
  const { concept, competitors, report } = snapshot;
  const releases = report.releaseWindows.flatMap((window) =>
    window.competingReleases.map((release) => ({ ...release, window: window.weekStart })),
  );
  const uniqueReleases = [...new Map(releases.map((release) => [release.igdbId, release])).values()];

  return (
    <article className="print-report" data-print-root>
      <header>
        <p className="print-eyebrow">ReleaseSignal market analysis</p>
        <h1>{concept.concept.title || "Untitled game concept"}</h1>
        <p>{concept.concept.shortDescription}</p>
        <dl className="print-meta">
          <div><dt>Generated</dt><dd>{new Date(snapshot.generatedAt).toLocaleString()}</dd></div>
          <div><dt>Snapshot</dt><dd>{snapshot.snapshotId}</dd></div>
          <div><dt>Corpus</dt><dd>{snapshot.corpusVersion}</dd></div>
        </dl>
      </header>

      <section>
        <h2>Concept and assumptions</h2>
        <dl className="print-grid">
          <div><dt>Primary genre</dt><dd>{concept.taxonomy.primaryGenre || "Unspecified"}</dd></div>
          <div><dt>Planned release</dt><dd>{concept.commercial.plannedRelease || "Unspecified"}</dd></div>
          <div><dt>Target price</dt><dd>{concept.commercial.priceUsd === null ? "Not provided" : money(concept.commercial.priceUsd)}</dd></div>
          <div><dt>Platforms</dt><dd>{concept.concept.platforms.join(", ")}</dd></div>
          <div><dt>Modes</dt><dd>{concept.taxonomy.gameModes.join(", ") || "Unspecified"}</dd></div>
          <div><dt>Perspective</dt><dd>{concept.taxonomy.perspective || "Unspecified"}</dd></div>
        </dl>
        <p><strong>Mechanics:</strong> {concept.taxonomy.mechanics.join(", ") || "Unspecified"}</p>
        <p><strong>Themes:</strong> {concept.taxonomy.themes.join(", ") || "Unspecified"}</p>
      </section>

      <section>
        <h2>Forecast</h2>
        <dl className="print-grid">
          <div><dt>Conservative revenue</dt><dd>{money(report.revenue.conservative)}</dd></div>
          <div><dt>Base revenue</dt><dd>{money(report.revenue.base)}</dd></div>
          <div><dt>Upside revenue</dt><dd>{money(report.revenue.upside)}</dd></div>
          <div><dt>Revenue confidence</dt><dd>{report.revenue.confidence}</dd></div>
          <div><dt>Market saturation</dt><dd>{report.saturation.score}/100 · {report.saturation.band}</dd></div>
          <div><dt>Predicted positive reviews</dt><dd>{report.reception.predictedPositiveRatio === null ? "Unavailable" : `${Math.round(report.reception.predictedPositiveRatio * 100)}%`}</dd></div>
        </dl>
        <h3>Release verdict: {report.verdict.decision}</h3>
        <p>Planned: {report.verdict.currentDate || "Unavailable"} · Recommended: {report.verdict.recommendedDate || "Unavailable"}</p>
        <ul>{report.verdict.reasoning.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </section>

      <section>
        <h2>Comparable games ({competitors.length})</h2>
        <table>
          <thead><tr><th>Game</th><th>Release</th><th>Price</th><th>Revenue</th><th>Copies</th><th>Reviews</th><th>Match</th></tr></thead>
          <tbody>
            {competitors.map(({ game, similarity }) => (
              <tr key={game.identity.steamAppId}>
                <td>{game.identity.name}</td>
                <td>{game.release.date || "TBD"}</td>
                <td>{money(game.commercial.priceUsd.value)}</td>
                <td>{money(game.commercial.estimatedRevenueUsd.value)}</td>
                <td>{count(game.commercial.estimatedCopiesSold.value)}</td>
                <td>{count(game.reviews.total.value)}</td>
                <td>{Math.round(similarity.score * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {competitors.map(({ game, similarity }) => (
          <div className="print-game" key={`detail-${game.identity.steamAppId}`}>
            <h3>{game.identity.name}</h3>
            <p>{game.metadata.summary || "No description available."}</p>
            <p><strong>Tags:</strong> {game.metadata.tags.join(", ") || "Unavailable"}</p>
            <p><strong>Why it matches:</strong> {similarity.rationale}</p>
            {game.reviews.comments?.length ? (
              <div>
                <strong>Review excerpts</strong>
                <ul>
                  {game.reviews.comments.slice(0, 3).map((comment) => (
                    <li key={comment.id}>{comment.recommended ? "Recommended" : "Not recommended"}: {comment.text}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </section>

      <section>
        <h2>Live launch calendar</h2>
        <p>IGDB MCP status: {report.releaseData.status} · fetched {new Date(report.releaseData.fetchedAt).toLocaleString()}</p>
        {report.releaseData.issues.length ? <ul>{report.releaseData.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : null}
        <table>
          <thead><tr><th>Game</th><th>Release window</th><th>Confidence</th><th>Similarity</th><th>Threat</th></tr></thead>
          <tbody>
            {uniqueReleases.map((release) => (
              <tr key={release.igdbId}>
                <td>{release.name}</td><td>{release.dateLabel}</td><td>{release.dateConfidence}</td>
                <td>{release.similarity}%</td><td>{release.threat}</td>
              </tr>
            ))}
            {report.undatedReleases.map((release) => (
              <tr key={release.igdbId}>
                <td>{release.name}</td><td>{release.dateLabel}</td><td>{release.dateConfidence}</td>
                <td>{release.similarity}%</td><td>{release.threat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  );
}
