import {
  isReviewTestEmail,
  REVIEW_TEST_CREDITS,
} from "@/lib/auth/review-test-account";
import { CREDIT_EVENT, CREDIT_TYPE } from "@/lib/consts";
import { addCreditHistory } from "@/lib/model/creditHistory";
import { addPermanentCredits, getUserBalance } from "@/lib/model/userBalance";

/**
 * 为新用户奖励积分
 * 如果用户没有 user_balance 记录，奖励 10 个永久积分
 * 支付审核测试账号奖励 1000 永久积分
 * 并记录到 credit_history 表
 */
export async function rewardNewUserCredits(
  userId: string,
  email?: string | null,
): Promise<void> {
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

    const isReviewAccount = isReviewTestEmail(email);
    const newUserCredits = isReviewAccount ? REVIEW_TEST_CREDITS : 10;
    // 尝试直接插入新记录，利用主键约束防止重复
    await addPermanentCredits(userId, newUserCredits);

    // 记录到 credit_history
    await addCreditHistory({
      userId,
      amount: newUserCredits,
      creditType: CREDIT_TYPE.PERMANENT,
      creditEvent: CREDIT_EVENT.NEW_USER_GRANT,
      description: isReviewAccount
        ? "payment review test account credits"
        : "new user welcome credits",
      referenceId: "",
    });
  } catch (error) {
    // 记录错误但不抛出，避免阻塞用户登录
    console.error("Failed to reward new user credits:", error);
  }
}

/**
 * 确保支付审核测试账号永久积分不少于 REVIEW_TEST_CREDITS。
 * 用于账号已存在但余额不足、或首次登录后补齐的场景。
 */
export async function ensureReviewTestAccountCredits(
  userId: string,
  email?: string | null,
): Promise<void> {
  if (!isReviewTestEmail(email) || !userId) {
    return;
  }

  try {
    const balance = await getUserBalance(userId);
    const current = balance?.permanentCredits ?? 0;
    if (current >= REVIEW_TEST_CREDITS) {
      return;
    }

    const topUp = REVIEW_TEST_CREDITS - current;
    await addPermanentCredits(userId, topUp);
    await addCreditHistory({
      userId,
      amount: topUp,
      creditType: CREDIT_TYPE.PERMANENT,
      creditEvent: CREDIT_EVENT.MANUAL_ADJUSTMENT,
      description: "payment review test account top-up",
      referenceId: "",
    });
    console.log(
      `[review-test] topped up ${topUp} permanent credits for ${email} (userId=${userId})`,
    );
  } catch (error) {
    console.error("Failed to ensure review test account credits:", error);
  }
}
