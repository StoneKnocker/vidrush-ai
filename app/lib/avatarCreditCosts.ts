export const AVATAR_CREDIT_COSTS = {
  textToAvatarBase: 10,
  textToAvatarTextureExtra: 10,
  imageToAvatarBase: 20,
  imageToAvatarTextureExtra: 10,
  multiImageToAvatarBase: 20,
  multiImageToAvatarTextureExtra: 10,
  textToImage: 5,
  autoRigging: 25,
  retargetAnimation: 10,
  addTexture: 10,
} as const;

export type AvatarCreditCostMode =
  | "text-to-avatar"
  | "text-to-image"
  | "image-to-avatar"
  | "multi-image-to-avatar"
  | "add-texture"
  | "auto-rigging";

export function getTextToAvatarCreditCost(autoTexture: boolean): number {
  return (
    AVATAR_CREDIT_COSTS.textToAvatarBase +
    (autoTexture ? AVATAR_CREDIT_COSTS.textToAvatarTextureExtra : 0)
  );
}

export function getImageToAvatarCreditCost(autoTexture: boolean): number {
  return (
    AVATAR_CREDIT_COSTS.imageToAvatarBase +
    (autoTexture ? AVATAR_CREDIT_COSTS.imageToAvatarTextureExtra : 0)
  );
}

export function getMultiImageToAvatarCreditCost(autoTexture: boolean): number {
  return (
    AVATAR_CREDIT_COSTS.multiImageToAvatarBase +
    (autoTexture ? AVATAR_CREDIT_COSTS.multiImageToAvatarTextureExtra : 0)
  );
}

export function getAutoRiggingCreditCost(animationCount: number): number {
  return (
    AVATAR_CREDIT_COSTS.autoRigging +
    Math.max(0, animationCount) * AVATAR_CREDIT_COSTS.retargetAnimation
  );
}

export function getAvatarCreditCost(
  mode: AvatarCreditCostMode,
  options: { autoTexture?: boolean; animationCount?: number } = {},
): number {
  switch (mode) {
    case "text-to-avatar":
      return getTextToAvatarCreditCost(options.autoTexture ?? false);
    case "text-to-image":
      return AVATAR_CREDIT_COSTS.textToImage;
    case "image-to-avatar":
      return getImageToAvatarCreditCost(options.autoTexture ?? false);
    case "multi-image-to-avatar":
      return getMultiImageToAvatarCreditCost(options.autoTexture ?? false);
    case "add-texture":
      return AVATAR_CREDIT_COSTS.addTexture;
    case "auto-rigging":
      return getAutoRiggingCreditCost(options.animationCount ?? 0);
  }
}
