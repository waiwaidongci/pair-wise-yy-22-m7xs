export interface RestorationStepCreatePayload {
  technique?: string;
  material_used?: string;
}

export interface RestorationStepFinishPayload {
  material_used?: string;
  /** 客户端读取到的步骤版本号，用于并发提交乐观锁判定 */
  expected_version?: number;
}
