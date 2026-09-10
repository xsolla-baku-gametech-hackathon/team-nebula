import 'server-only';
import { z } from 'zod';
import { parseJson, parseProvider, requestText } from './http';
import { plainText } from './steam-details';
import type { ReviewComment } from './types';

const count = z.number().int().nonnegative().finite();
const SummarySchema = z.object({
  total_reviews: count, total_positive: count, total_negative: count,
  review_score_desc: z.string(),
}).refine(v => v.total_reviews === v.total_positive + v.total_negative);
export type ReviewSummary = z.infer<typeof SummarySchema>;
const CommentSchema = z.object({
  recommendationid: z.string().min(1),
  review: z.string().min(1),
  language: z.literal('english'),
  voted_up: z.boolean(),
  timestamp_created: z.number().int().nonnegative().max(253402300799),
  votes_up: count,
});

export function parseReviewSummary(input: unknown): ReviewSummary {
  return parseProvider('steam', z.object({ success:z.literal(1), query_summary:SummarySchema }), input).query_summary;
}

export function parseReviewComments(input: unknown): ReviewComment[] {
  const envelope = parseProvider('steam', z.object({success:z.literal(1),reviews:z.array(z.unknown())}), input);
  const unique = new Map<string, ReviewComment>();
  for (const raw of envelope.reviews) {
    const parsed = CommentSchema.safeParse(raw);
    if (!parsed.success) continue;
    const review = parsed.data;
    const text = plainText(review.review, 2000);
    if (!text || unique.has(review.recommendationid)) continue;
    unique.set(review.recommendationid, {
      id: review.recommendationid, text, language:'english', recommended:review.voted_up,
      createdAt:new Date(review.timestamp_created * 1000).toISOString(), helpfulVotes:review.votes_up,
    });
  }
  return [...unique.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,3);
}

export async function fetchSteamReviews(appId: number) {
  const data = parseReviewSummary(parseJson('steam', await requestText(
    'steam', `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&review_type=all&filter=all&num_per_page=1`,
  )));
  return { data, fetchedAt: new Date().toISOString() };
}
export async function fetchSteamComments(appId: number) {
  const data = parseReviewComments(parseJson('steam', await requestText(
    'steam', `https://store.steampowered.com/appreviews/${appId}?json=1&language=english&purchase_type=all&review_type=all&filter=recent&num_per_page=3`,
  )));
  return { data, fetchedAt: new Date().toISOString() };
}
