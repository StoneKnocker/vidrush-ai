import { CREDIT_TYPE } from "@/lib/consts";
import { isDevelopment } from "~/lib/env.server";

function getCreemProductId(planId: string) {
  const isDev = isDevelopment;
  switch (planId) {
    // Legacy plans (keep for existing subscriptions)
    case "creator-monthly":
      return isDev
        ? "prod_8LKM20XZ2bujLseIXnQdy"
        : "prod_4G0qDnJVVozfug9uVkxcVx";
    case "creator-yearly":
      return isDev
        ? "prod_63cwTahpaukB7hpVMlWqsj"
        : "prod_JuMVkFxEYJKGbAqOhJhiP";
    case "pro-monthly":
      return isDev
        ? "prod_4IuDUluf0t8P33y8DEC3XE"
        : "prod_5tFnoWR4UQeUUetycDfmH4";
    case "pro-yearly":
      return isDev
        ? "prod_yP4mrsiEhr36U5n0VWj6a"
        : "prod_6Tq2fTTFPWPBIdZ50AJfIy";
    // Legacy credit packs
    case "pack-700":
      return isDev
        ? "prod_wuEiihfNqhYiGE6G1059G"
        : "prod_2oKl0XErT1w9dzqqZfmfuQ";
    case "pack-1500":
      return isDev
        ? "prod_2NSfPX9J0MZhVQQdf0pEYo"
        : "prod_3xWVIT4XrRqtWIQpy1gwwp";

    // New subscription plans (TODO: create Creem products and replace nulls)
    case "basic-monthly":
      return null;
    case "basic-yearly":
      return null;
    case "standard-monthly":
      return null;
    case "standard-yearly":
      return null;
    case "max-monthly":
      return null;
    case "max-yearly":
      return null;

    // New credit packs (TODO: create Creem products and replace nulls)
    case "pack-starter":
      return null;
    case "pack-creator":
      return null;
    case "pack-professional":
      return null;
    case "pack-advanced":
      return null;
    case "pack-ultra":
      return null;
    case "pack-max":
      return null;

    default:
      return null;
  }
}

function getProductId(planId: string) {
  return getCreemProductId(planId);
}

const PRODUCTS = {
  // Legacy subscription plans (keep for existing subscriptions)
  "creator-monthly": {
    productId: getProductId("creator-monthly"),
    creditsAmount: 350,
    price: 29,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "creator-yearly": {
    productId: getProductId("creator-yearly"),
    creditsAmount: 4200,
    price: 228,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "pro-monthly": {
    productId: getProductId("pro-monthly"),
    creditsAmount: 4000,
    price: 99.9,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "pro-yearly": {
    productId: getProductId("pro-yearly"),
    creditsAmount: 48000,
    price: 598.8,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  // Legacy credit packs (keep for existing purchases)
  "pack-700": {
    productId: getProductId("pack-700"),
    creditsAmount: 700,
    price: 49,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-1500": {
    productId: getProductId("pack-1500"),
    creditsAmount: 1500,
    price: 99,
    creditType: CREDIT_TYPE.PERMANENT,
  },

  // New subscription plans
  "basic-monthly": {
    productId: getProductId("basic-monthly"),
    creditsAmount: 800,
    price: 29.9,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "basic-yearly": {
    productId: getProductId("basic-yearly"),
    creditsAmount: 9600,
    price: 178.8,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "standard-monthly": {
    productId: getProductId("standard-monthly"),
    creditsAmount: 1600,
    price: 49.9,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "standard-yearly": {
    productId: getProductId("standard-yearly"),
    creditsAmount: 19200,
    price: 298.8,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "max-monthly": {
    productId: getProductId("max-monthly"),
    creditsAmount: 10000,
    price: 199.9,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "max-yearly": {
    productId: getProductId("max-yearly"),
    creditsAmount: 120000,
    price: 1198.8,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },

  // New credit packs
  "pack-starter": {
    productId: getProductId("pack-starter"),
    creditsAmount: 1000,
    price: 39.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-creator": {
    productId: getProductId("pack-creator"),
    creditsAmount: 3000,
    price: 89.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-professional": {
    productId: getProductId("pack-professional"),
    creditsAmount: 8000,
    price: 199.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-advanced": {
    productId: getProductId("pack-advanced"),
    creditsAmount: 30000,
    price: 599.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-ultra": {
    productId: getProductId("pack-ultra"),
    creditsAmount: 100000,
    price: 1899.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
  "pack-max": {
    productId: getProductId("pack-max"),
    creditsAmount: 200000,
    price: 3599.9,
    creditType: CREDIT_TYPE.PERMANENT,
  },
};

export function getProduct(planId: string) {
  const product = PRODUCTS[planId as keyof typeof PRODUCTS];

  if (!product) {
    throw new Error(`Product not found for planId: ${planId}`);
  }

  return product;
}
