export type MilestoneStatus = 'on' | 'off';

export interface PingMilestoneVO extends BaseEntity {
  id: number | string;
  milestoneDate: string;
  content: string;
  status: MilestoneStatus;
  sortOrder: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PingMilestoneQuery extends PageQuery {
  keyword?: string;
  status?: MilestoneStatus | '';
}

export interface PingMilestoneForm extends BaseEntity {
  id?: number | string;
  milestoneDate: string;
  content: string;
  status: MilestoneStatus;
  sortOrder: number;
  remark?: string;
}
