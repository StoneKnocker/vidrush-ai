import { feedbackRouter } from "./feedbackRouter";
import { router } from "./init";
import { paymentRouter } from "./paymentRouter";
import { r2Router } from "./r2Router";
import { tripoRouter } from "./tripoRouter";
import { userRouter } from "./userRouter";

export const appRouter = router({
  user: userRouter,
  feedback: feedbackRouter,
  payment: paymentRouter,
  avatar: tripoRouter,
  r2: r2Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
