import { db, type InMemoryDatabase } from "../database/inMemoryDb";
import type { RestorationPlan } from "../models/RestorationPlan";
import { isOpenPlanStatus } from "../constants/PlanApprovalStatus";

class RestorationPlanRepository {
  findAll(context: InMemoryDatabase = db): RestorationPlan[] {
    return context.plans;
  }

  findById(id: number, context: InMemoryDatabase = db): RestorationPlan | undefined {
    return context.plans.find((row) => row.id === id);
  }

  findByDamage(damageRecordId: number, context: InMemoryDatabase = db): RestorationPlan[] {
    return context.plans
      .filter((row) => row.damage_record_id === damageRecordId)
      .sort((a, b) => a.id - b.id);
  }

  findByRelic(relicId: number, context: InMemoryDatabase = db): RestorationPlan[] {
    return context.plans
      .filter((row) => row.relic_id === relicId)
      .sort((a, b) => a.id - b.id);
  }

  /**
   * 同一病害只能有一份未结束方案：查找任何处于未结束状态的方案（不限修订版）。
   * 已被更正取代而标记 affected 的旧档不再占用名额；
   * excludePlanId 用于方案更正时排除正在被更正的方案自身。
   */
  findOpenByDamageNo(
    damageNo: string,
    context: InMemoryDatabase = db,
    options: { includeAffected?: boolean; excludePlanId?: number } = {}
  ): RestorationPlan | undefined {
    return context.plans.find(
      (row) =>
        row.damage_no === damageNo &&
        isOpenPlanStatus(row.approval_status) &&
        (options.includeAffected === true || row.affected === false) &&
        row.id !== options.excludePlanId
    );
  }

  /** 某病害编号下的全部方案，按修订号升序 */
  findRevisionsByDamageNo(damageNo: string, context: InMemoryDatabase = db): RestorationPlan[] {
    return context.plans
      .filter((row) => row.damage_no === damageNo)
      .sort((a, b) => a.plan_revision - b.plan_revision);
  }

  /** 该病害编号下下一个方案修订号 */
  nextPlanRevision(damageNo: string, context: InMemoryDatabase = db): number {
    return this.findRevisionsByDamageNo(damageNo, context).length + 1;
  }

  insert(row: Omit<RestorationPlan, "id">, context: InMemoryDatabase = db): RestorationPlan {
    const record: RestorationPlan = { ...row, id: context.nextId("plans") };
    context.plans.push(record);
    return record;
  }

  update(id: number, patch: Partial<RestorationPlan>, context: InMemoryDatabase = db): RestorationPlan {
    const record = this.findById(id, context);
    Object.assign(record as object, patch);
    return record as RestorationPlan;
  }
}

export const restorationPlanRepository = new RestorationPlanRepository();
