/**
 * Update daily SOV aggregates after new mention is created
 * 
 * Recalculates:
 * - sov_percent: percentage of prompts where brand was mentioned
 * - mentions_count: total brand mentions
 * - avg_sentiment: average sentiment score
 */

export async function updateAggregates(supabaseClient: any, projectId: string): Promise<void> {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Calculate aggregates for today
    const { data: stats, error: statsError } = await supabaseClient
      .rpc('calculate_daily_sov', {
        p_project_id: projectId,
        p_date: currentDate,
      });
    
    if (statsError) {
      console.error('RPC calculate_daily_sov failed, using fallback:', statsError);
      // Fallback to manual calculation
      await manualAggregateCalculation(supabaseClient, projectId, currentDate);
      return;
    }
    
    console.log(`Updated aggregates for project ${projectId} on ${currentDate}`);
  } catch (error) {
    console.error('Failed to update aggregates:', error);
    throw error;
  }
}

// =====================================================
// Manual aggregate calculation (fallback)
// =====================================================
async function manualAggregateCalculation(
  supabaseClient: any,
  projectId: string,
  date: string
): Promise<void> {
  // Get all mentions for today
  const { data: mentions, error: mentionsError } = await supabaseClient
    .from('mentions')
    .select('brand_mentioned, sentiment_score')
    .eq('project_id', projectId)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);
  
  if (mentionsError) {
    throw new Error(`Failed to fetch mentions: ${mentionsError.message}`);
  }
  
  if (!mentions || mentions.length === 0) {
    // No mentions yet, skip aggregation
    return;
  }
  
  const totalMentions = mentions.length;
  const brandMentions = mentions.filter((m: any) => m.brand_mentioned);
  const brandMentionsCount = brandMentions.length;
  const sovPercent = (brandMentionsCount / totalMentions) * 100;
  
  // Calculate average sentiment (only for mentions where brand was found)
  const sentimentScores = brandMentions
    .map((m: any) => m.sentiment_score)
    .filter((s: number | null) => s !== null);
  
  const avgSentiment = sentimentScores.length > 0
    ? sentimentScores.reduce((a: number, b: number) => a + b, 0) / sentimentScores.length
    : null;
  
  // Upsert into sov_history
  const { error: upsertError } = await supabaseClient
    .from('sov_history')
    .upsert(
      {
        project_id: projectId,
        date: date,
        sov_percent: sovPercent,
        mentions_count: brandMentionsCount,
        avg_sentiment: avgSentiment,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'project_id,date',
      }
    );
  
  if (upsertError) {
    throw new Error(`Failed to upsert sov_history: ${upsertError.message}`);
  }
  
  console.log(`Manual aggregate calculation complete: SOV=${sovPercent.toFixed(2)}%, mentions=${brandMentionsCount}`);
}
