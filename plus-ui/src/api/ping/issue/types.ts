export type PingIssueType = 'problem' | 'suggestion' | 'cooperation';
export type PingIssueStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface PingIssueAttachmentVO {
  ossId: string;
  url: string;
  originalName: string;
  size: number;
}

export interface PingIssueMessageVO {
  id: string;
  issueId: string;
  senderUserId?: string;
  senderName: string;
  senderType: 'user' | 'admin';
  content: string;
  attachments: PingIssueAttachmentVO[];
  publicVisible: boolean;
  createTime: string;
  updateTime?: string;
}

export interface PingIssueVO {
  id: string;
  userId: string;
  userName: string;
  nickname?: string;
  issueType: PingIssueType;
  title: string;
  content: string;
  attachments: PingIssueAttachmentVO[];
  messages: PingIssueMessageVO[];
  status: PingIssueStatus;
  publicVisible: boolean;
  adminReply?: string;
  replyUserId?: string;
  replyUserName?: string;
  replyTime?: string;
  remark?: string;
  createTime: string;
  updateTime?: string;
}

export interface PingIssueQuery extends PageQuery {
  keyword?: string;
  issueType?: PingIssueType | '';
  status?: PingIssueStatus | '';
  publicVisible?: boolean | '';
  params?: Record<string, unknown>;
}

export interface PingIssueReviewForm {
  id: string;
  status: PingIssueStatus;
  publicVisible: boolean;
  remark: string;
}

export interface PingIssueAdminMessageForm {
  content: string;
  publicVisible: boolean;
}

export interface PingIssueMessageVisibilityForm {
  id: string;
  publicVisible: boolean;
}
