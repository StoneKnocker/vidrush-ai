import { CREDIT_TYPE } from "@/lib/consts";
import { isDevelopment } from "~/lib/env.server";

function getCreemProductId(planId: string) {
  const isDev = isDevelopment;
  switch (planId) {
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
    // Credit Packs
    case "pack-700":
      return isDev
        ? "prod_wuEiihfNqhYiGE6G1059G"
        : "prod_2oKl0XErT1w9dzqqZfmfuQ";
    case "pack-1500":
      return isDev
        ? "prod_2NSfPX9J0MZhVQQdf0pEYo"
        : "prod_3xWVIT4XrRqtWIQpy1gwwp";
    default:
      return null;
  }
}

function getProductId(planId: string) {
  return getCreemProductId(planId);
}

const PRODUCTS = {
  // Subscription Plans
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
    creditsAmount: 900,
    price: 59,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  "pro-yearly": {
    productId: getProductId("pro-yearly"),
    creditsAmount: 10800,
    price: 468,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
  },
  // Credit Packs
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
};

export function getProduct(planId: string) {
  const product = PRODUCTS[planId as keyof typeof PRODUCTS];

  if (!product) {
    throw new Error(`Product not found for planId: ${planId}`);
  }

  return product;
}
