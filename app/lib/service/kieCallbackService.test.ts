import { beforeEach, describe, expect, it, vi } from "vitest";

const completeTaskMock = vi.fn();
const setTaskFailedMock = vi.fn();
const downloadAndUploadMock = vi.fn();

vi.mock("~/lib/model/userTask", () => ({
  completeTask: completeTaskMock,
  getTaskByProviderTaskId: vi.fn(),
  markTaskProcessing: vi.fn(),
}));

vi.mock("~/lib/r2/r2.server", () => ({
  downloadAndUpload: downloadAndUploadMock,
  getServerR2Url: (key: string) => `https://r2.example.com/${key}`,
}));

vi.mock("~/lib/service/taskService", () => ({
  setTaskFailed: setTaskFailedMock,
}));

vi.mock("../env.server", () => ({
  serverEnv: {
    KIE_WEBHOOK_HMAC_KEY: "test-secret",
  },
}));

describe("KIE callback service", () => {
  beforeEach(() => {
    completeTaskMock.mockReset();
    setTaskFailedMock.mockReset();
    downloadAndUploadMock.mockReset();
    downloadAndUploadMock.mockResolvedValue(true);
  });

  it("persists Seedance first and last frame URLs to R2 before completing task", async () => {
    const { completeKieTaskFromPayload } = await import("./kieCallbackService");

    await completeKieTaskFromPayload({
      taskId: "task-1",
      body: {
        resultJson: JSON.stringify({
          resultUrls: ["https://kie.example.com/result.mp4"],
          firstFrameUrl: "https://kie.example.com/first.webp",
          lastFrameUrl: "https://kie.example.com/last.webp",
        }),
      },
    });

    expect(downloadAndUploadMock).toHaveBeenCalledTimes(3);
    expect(downloadAndUploadMock).toHaveBeenNthCalledWith(
      2,
      "https://kie.example.com/first.webp",
      "kie/results/task-1/2.webp",
    );
    expect(downloadAndUploadMock).toHaveBeenNthCalledWith(
      3,
      "https://kie.example.com/last.webp",
      "kie/results/task-1/3.webp",
    );
    expect(completeTaskMock).toHaveBeenCalledWith("task-1", {
      videos: ["kie/results/task-1/1.mp4"],
      images: ["kie/results/task-1/2.webp", "kie/results/task-1/3.webp"],
    });
  });
});
