export const FREE_SHIPPING_THRESHOLD = 700;
export const STANDARD_SHIPPING_COST = 23;

export const getShippingCost = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
