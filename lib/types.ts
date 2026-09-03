export interface TranscriptSegment {
  start: number;
  end: number;
  speaker?: string;
  text: string;
}

export interface MeetingSummaryData {
  overview: string;
  keyDiscussionPts: string[];
  participants: string[];
}

export interface ActionItemData {
  id?: string;
  description: string;
  responsiblePerson?: string;
  deadline?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface DecisionData {
  id?: string;
  description: string;
  category?: string;
}

export interface TopicData {
  id?: string;
  name: string;
  summary?: string;
  timestamp?: string;
}

export interface MeetingFullDetails {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  duration: number;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string | null;
  createdAt: string;
  transcript?: {
    content: string;
    segments: TranscriptSegment[];
  };
  summary?: MeetingSummaryData;
  actionItems: ActionItemData[];
  decisions: DecisionData[];
  topics: TopicData[];
  chats: {
    id: string;
    userQuestion: string;
    aiResponse: string;
    createdAt: string;
  }[];
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}
