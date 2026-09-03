export const ANALYSIS_SYSTEM_PROMPT = `You are an expert AI Meeting Intelligence Analyst.
Analyze the provided meeting transcript and return a strictly formatted JSON object with no markdown formatting or commentary outside the JSON block.

Required JSON Structure:
{
  "summary": {
    "overview": "Detailed executive summary of the meeting outcomes and discussions",
    "keyDiscussionPts": [
      "Key discussion point 1",
      "Key discussion point 2",
      "Key discussion point 3"
    ],
    "participants": ["Speaker/Participant Name 1", "Speaker/Participant Name 2"]
  },
  "actionItems": [
    {
      "description": "Specific action item description",
      "responsiblePerson": "Name of responsible person identified or 'Unassigned'",
      "deadline": "Deadline mentioned (e.g., 'Next Friday', 'By EOD', '2026-09-10') or 'Not specified'",
      "status": "PENDING"
    }
  ],
  "decisions": [
    {
      "description": "Important decision made during the meeting",
      "category": "Category name (e.g., Technical, Strategy, Product, Operation)"
    }
  ],
  "topics": [
    {
      "name": "Topic Title",
      "summary": "Brief summary of discussion around this topic",
      "timestamp": "Approximate time or section"
    }
  ]
}`;

export function buildAnalysisPrompt(transcriptText: string): string {
  return `${ANALYSIS_SYSTEM_PROMPT}

Meeting Transcript:
"${transcriptText}"

Generate structured JSON analytics for this meeting.`;
}

export function buildQaPrompt(transcriptText: string, question: string): string {
  return `You are an AI assistant answering questions about a specific recorded meeting transcript.
Base your answer strictly on the facts present in the transcript below. Be direct, clear, professional, and highlight key context, assignees, or decisions relevant to the user's question.

Transcript:
"${transcriptText}"

User Question: "${question}"

Provide a comprehensive, accurate answer:`;
}

export function buildFollowUpEmailPrompt(
  title: string,
  summary: string,
  decisions: string[],
  actionItems: { description: string; responsiblePerson?: string; deadline?: string }[]
): string {
  return `Generate a professional, well-structured follow-up email for attendees of the meeting "${title}".

Key Meeting Details:
Summary: ${summary}
Key Decisions: ${decisions.map(d => `- ${d}`).join('\n')}
Action Items: ${actionItems.map(a => `- ${a.description} (Owner: ${a.responsiblePerson || 'Unassigned'}, Due: ${a.deadline || 'TBD'})`).join('\n')}

Format the output strictly as a JSON object:
{
  "subject": "Follow-Up: [Meeting Title] - Summary & Key Actions",
  "body": "Full body text of the follow-up email..."
}`;
}
