import { CREDIT_EVENT, CREDIT_TYPE } from "@/lib/consts";
import { addCreditHistory } from "@/lib/model/creditHistory";
import { addPermanentCredits, getUserBalance } from "@/lib/model/userBalance";

/**
 * 为新用户奖励积分
 * 如果用户没有 user_balance 记录，奖励 10 个永久积分
 * 并记录到 credit_history 表
 */
export async function rewardNewUserCredits(userId: string): Promise<void> {
  console.log("rewardNewUserCredits called for userId:", userId);
  // 验证输入
  if (!userId || typeof userId !== "string") {
    console.error("Invalid userId provided to rewardNewUserCredits");
    return;
  }

  try {
    // 检查用户是否已有 user_balance 记录
    const existingBalance = await getUserBalance(userId);

    // 如果已有记录，不进行任何操作
    if (existingBalance?.userId) {
      return;
    }

    const newUserCredits = 10;
    // 尝试直接插入新记录，利用主键约束防止重复
    await addPermanentCredits(userId, newUserCredits);

    // 记录到 credit_history
    await addCreditHistory({
      userId,
      amount: newUserCredits,
      creditType: CREDIT_TYPE.PERMANENT,
      creditEvent: CREDIT_EVENT.NEW_USER_GRANT,
      description: "new user welcome credits",
      referenceId: "",
    });
  } catch (error) {
    // 记录错误但不抛出，避免阻塞用户登录
    console.error("Failed to reward new user credits:", error);
  }
}
