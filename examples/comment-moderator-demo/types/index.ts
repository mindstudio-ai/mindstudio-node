export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  isModerated: boolean;
  moderationResult?: {
    isApproved: boolean;
    reason?: string;
  };
}
