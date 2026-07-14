declare module 'sslcommerz-lts' {
  export interface ISSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
    shipping_method: string;
    product_name: string;
    product_category: string;
    product_profile: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_add2?: string;
    cus_city: string;
    cus_state?: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    cus_fax?: string;
    ship_name?: string;
    ship_add1?: string;
    ship_add2?: string;
    ship_city?: string;
    ship_state?: string;
    ship_postcode?: string | number;
    ship_country?: string;
    [key: string]: unknown;
  }

  export interface ISSLCommerzInitResponse {
    status: string;
    GatewayPageURL?: string;
    sessionkey?: string;
    failedreason?: string;
    [key: string]: unknown;
  }

  export interface ISSLCommerzValidationResponse {
    status: string;
    tran_id: string;
    val_id: string;
    amount: string;
    currency: string;
    bank_tran_id?: string;
    [key: string]: unknown;
  }

  export default class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isLive?: boolean);
    init(data: ISSLCommerzInitData): Promise<ISSLCommerzInitResponse>;
    validate(data: { val_id: string }): Promise<ISSLCommerzValidationResponse>;
    initiateRefund(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    refundQuery(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    transactionQueryByTransactionId(data: { tran_id: string }): Promise<Record<string, unknown>>;
    transactionQueryBySessionId(data: { sessionkey: string }): Promise<Record<string, unknown>>;
  }
}
