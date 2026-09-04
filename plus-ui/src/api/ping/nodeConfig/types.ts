export interface PingNodeConfigVO {
  id: string | number;
  country: string;
  overseas: string;
  region: string;
  province: string;
  city: string;
  operators: string;
  name: string;
  ip: string;
  weight: number;
  state: string;
  rqState: string;
  exchange: string;
  queue: string;
  binding: string;
  sponsorText: string;
  sponsorUrl: string;
  content: string;
  content2: string;
  content3: string;
  createTime: number;
  endTime: number;
  online: number;
  uuid: string;
  homeState: boolean;
  traceroute: boolean;
  ipv6: boolean;
  coordinate: string;
}

export interface PingNodeConfigForm {
  id?: string | number;
  country?: string;
  overseas?: string;
  region?: string;
  province?: string;
  city?: string;
  operators?: string;
  name?: string;
  ip?: string;
  weight?: number;
  state?: string;
  rqState?: string;
  exchange?: string;
  queue?: string;
  binding?: string;
  sponsorText?: string;
  sponsorUrl?: string;
  content?: string;
  content2?: string;
  content3?: string;
  createTime?: number;
  endTime?: number;
  online?: number;
  uuid?: string;
  homeState?: boolean;
  traceroute?: boolean;
  ipv6?: boolean;
  coordinate?: string;
}

export interface PingNodeConfigQuery extends PageQuery {
  country?: string;
  overseas?: string;
  region?: string;
  province?: string;
  city?: string;
  operators?: string;
  name?: string;
  ip?: string;
  weight?: number;
  state?: string;
  rqState?: string;
  exchange?: string;
  queue?: string;
  binding?: string;
  sponsorText?: string;
  sponsorUrl?: string;
  uuid?: string;
  homeState?: boolean;
  traceroute?: boolean;
  ipv6?: boolean;
  params?: any;
}

export interface PingIpDatabaseStatusVO {
  version: 'ipv4' | 'ipv6';
  custom: boolean;
  fileName: string;
  fileSize: number;
  updatedAt?: string;
}

export interface PingAgentDeployConfigVO {
  id?: string | number;
  configKey: string;
  amd64ImageOssId?: string | number;
  amd64ImageUrl?: string;
  amd64ImageFileName?: string;
  arm64ImageOssId?: string | number;
  arm64ImageUrl?: string;
  arm64ImageFileName?: string;
  imageName: string;
  masterUrl: string;
  dockerInstallTemplate: string;
  firstDeployTemplate: string;
  updateTemplate: string;
  remark?: string;
  updateTime?: string;
}

export type PingAgentDeployConfigForm = PingAgentDeployConfigVO;

export interface PingAgentArchitectureCommandVO {
  architecture: 'amd64' | 'arm64';
  label: string;
  imageOssId?: string | number;
  imageUrl?: string;
  imageFileName?: string;
  available: boolean;
  firstInstallCommand?: string;
  firstDeployCommand?: string;
  updateCommand?: string;
}

export interface PingAgentDeploymentVO {
  nodeId: string | number;
  nodeName: string;
  nodeUuid: string;
  masterUrl: string;
  imageName: string;
  uuidFilePath: string;
  architectures: PingAgentArchitectureCommandVO[];
}

export interface PingOssUploadVO {
  ossId: string | number;
  fileName: string;
  url: string;
}
