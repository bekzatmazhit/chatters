/**
 * Evaluate project triggers after aggregate update
 * 
 * Checks if any active triggers should fire based on:
 * - SOV thresholds
 * - Sentiment changes
 * - Mention count thresholds
 * 
 * Creates alerts and sends notifications if conditions are met
 */

export async function evaluateTriggers(supabaseClient: any, projectId: string): Promise<void> {
  try {
    // Fetch active triggers for this project
    const { data: triggers, error: triggersError } = await supabaseClient
      .from('triggers')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true);
    
    if (triggersError) {
      throw new Error(`Failed to fetch triggers: ${triggersError.message}`);
    }
    
    if (!triggers || triggers.length === 0) {
      console.log(`No active triggers for project ${projectId}`);
      return;
    }
    
    // Get current aggregates for today
    const currentDate = new Date().toISOString().split('T')[0];
    const { data: currentStats, error: statsError } = await supabaseClient
      .from('sov_history')
      .select('*')
      .eq('project_id', projectId)
      .eq('date', currentDate)
      .single();
    
    if (statsError || !currentStats) {
      console.warn('No current stats available for trigger evaluation');
      return;
    }
    
    // Evaluate each trigger
    for (const trigger of triggers) {
      const shouldFire = await checkTriggerCondition(trigger, currentStats, supabaseClient, projectId);
      
      if (shouldFire) {
        await fireTrigger(supabaseClient, trigger, currentStats, projectId);
      }
    }
    
    console.log(`Evaluated ${triggers.length} triggers for project ${projectId}`);
  } catch (error) {
    console.error('Failed to evaluate triggers:', error);
    // Don't throw - trigger evaluation is non-critical
  }
}

// =====================================================
// Check if trigger condition is met
// =====================================================
async function checkTriggerCondition(
  trigger: any,
  currentStats: any,
  supabaseClient: any,
  projectId: string
): Promise<boolean> {
  const { metric, operator, threshold_value } = trigger;
  
  let currentValue: number;
  
  // Determine current value based on metric type
  switch (metric) {
    case 'sov':
      currentValue = currentStats.sov_percent;
      break;
    
    case 'mentions':
      currentValue = currentStats.mentions_count;
      break;
    
    case 'sentiment':
      currentValue = currentStats.avg_sentiment || 0;
      break;
    
    case 'hallucinations':
      // Count hallucinations for today
      const { data: halluCount } = await supabaseClient
        .from('hallucinations')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('created_at', `${currentStats.date}T00:00:00`);
      currentValue = halluCount || 0;
      break;
    
    default:
      console.warn(`Unknown metric type: ${metric}`);
      return false;
  }
  
  // Check operator
  switch (operator) {
    case '<':
      return currentValue < threshold_value;
    case '>':
      return currentValue > threshold_value;
    case '<=':
      return currentValue <= threshold_value;
    case '>=':
      return currentValue >= threshold_value;
    case '=':
      return Math.abs(currentValue - threshold_value) < 0.01;
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

// =====================================================
// Fire trigger: create alert + send notification
// =====================================================
async function fireTrigger(
  supabaseClient: any,
  trigger: any,
  currentStats: any,
  projectId: string
): Promise<void> {
  try {
    // Check if this trigger already fired recently (within 3 hours)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    
    const { data: recentAlerts } = await supabaseClient
      .from('alerts')
      .select('id')
      .eq('trigger_id', trigger.id)
      .gte('created_at', threeHoursAgo)
      .limit(1);
    
    if (recentAlerts && recentAlerts.length > 0) {
      console.log(`Trigger ${trigger.id} already fired recently, skipping`);
      return;
    }
    
    // Construct alert message
    const message = buildAlertMessage(trigger, currentStats);
    
    // Create alert
    const { data: alert, error: alertError } = await supabaseClient
      .from('alerts')
      .insert({
        project_id: projectId,
        trigger_id: trigger.id,
        message,
        status: 'new',
        metadata: {
          current_value: getCurrentValue(trigger.metric, currentStats),
          threshold: trigger.threshold_value,
          operator: trigger.operator,
          metric: trigger.metric,
        },
      })
      .select()
      .single();
    
    if (alertError) {
      throw new Error(`Failed to create alert: ${alertError.message}`);
    }
    
    console.log(`Created alert ${alert.id} for trigger ${trigger.name}`);
    
    // Update trigger's last_triggered_at
    await supabaseClient
      .from('triggers')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', trigger.id);
    
    // Create activity event
    await supabaseClient
      .from('activity_events')
      .insert({
        project_id: projectId,
        event_type: 'trigger',
        title: `Сработал триггер: ${trigger.name}`,
        description: message,
        details: {
          trigger_id: trigger.id,
          alert_id: alert.id,
          metric: trigger.metric,
          current_value: getCurrentValue(trigger.metric, currentStats),
        },
      });
    
    // Send notification if channel is configured
    if (trigger.notification_channel) {
      await sendNotification(supabaseClient, projectId, trigger.notification_channel, message, alert);
    }
  } catch (error) {
    console.error('Failed to fire trigger:', error);
  }
}

// =====================================================
// Build alert message
// =====================================================
function buildAlertMessage(trigger: any, currentStats: any): string {
  const currentValue = getCurrentValue(trigger.metric, currentStats);
  const metricName = getMetricDisplayName(trigger.metric);
  
  return `${metricName} ${trigger.operator} ${trigger.threshold_value} (текущее: ${currentValue})`;
}

function getCurrentValue(metric: string, stats: any): number {
  switch (metric) {
    case 'sov':
      return Number(stats.sov_percent?.toFixed(2)) || 0;
    case 'mentions':
      return stats.mentions_count || 0;
    case 'sentiment':
      return Number(stats.avg_sentiment?.toFixed(2)) || 0;
    default:
      return 0;
  }
}

function getMetricDisplayName(metric: string): string {
  const names: Record<string, string> = {
    sov: 'Доля голоса (SOV)',
    mentions: 'Количество упоминаний',
    sentiment: 'Средняя тональность',
    hallucinations: 'Галлюцинации',
  };
  return names[metric] || metric;
}

// =====================================================
// Send notification via integration
// =====================================================
async function sendNotification(
  supabaseClient: any,
  projectId: string,
  channel: string,
  message: string,
  alert: any
): Promise<void> {
  try {
    // Check if integration is connected
    const { data: integration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)
      .eq('provider', channel.toLowerCase())
      .eq('status', 'connected')
      .single();
    
    if (!integration) {
      console.log(`${channel} integration not connected for project ${projectId}`);
      return;
    }
    
    // Call notification Edge Function
    const { error: notifyError } = await supabaseClient.functions.invoke('send-notification', {
      body: {
        project_id: projectId,
        channel,
        message,
        alert_id: alert.id,
        integration_config: integration.config,
      },
    });
    
    if (notifyError) {
      console.error('Failed to send notification:', notifyError);
    } else {
      console.log(`Sent ${channel} notification for alert ${alert.id}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
