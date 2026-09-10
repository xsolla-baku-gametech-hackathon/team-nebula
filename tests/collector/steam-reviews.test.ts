import { expect, it } from 'vitest';
import { parseReviewComments, parseReviewSummary } from '@/lib/collector/steam-reviews';

const comment = (id: number) => ({
  recommendationid:String(id), review:'<b>Enjoyed it &amp; recommend it.</b>', language:'english',
  voted_up:true, timestamp_created:1700000000+id, votes_up:2,
  author:{steamid:'private-identifier'},
});
it('returns at most three recent unique English comments without author identifiers', () => {
  const comments = parseReviewComments({success:1,reviews:[
    comment(1),comment(2),comment(3),comment(4),comment(4),{...comment(5),language:'german'},
    {...comment(6),timestamp_created:Infinity},
  ]});
  expect(comments.map(r => r.id)).toEqual(['4','3','2']);
  expect(comments[0].text).toBe('Enjoyed it & recommend it.');
  expect(JSON.stringify(comments)).not.toContain('private-identifier');
});
it('handles fewer than three comments and keeps aggregates separate', () => {
  expect(parseReviewComments({success:1,reviews:[]})).toEqual([]);
  expect(parseReviewComments({success:1,reviews:[comment(1)]})).toHaveLength(1);
  expect(parseReviewSummary({success:1,query_summary:{
    total_reviews:1000,total_positive:900,total_negative:100,review_score_desc:'Very Positive',
  }}).total_reviews).toBe(1000);
});
it('rejects failed and inconsistent summaries rather than inventing zeros', () => {
  expect(() => parseReviewSummary({success:0})).toThrow();
  expect(() => parseReviewSummary({success:1,query_summary:{total_reviews:10,total_positive:9,total_negative:4,review_score_desc:'x'}})).toThrow();
  expect(parseReviewSummary({success:1,query_summary:{total_reviews:0,total_positive:0,total_negative:0,review_score_desc:'No reviews'}}).total_reviews).toBe(0);
});
