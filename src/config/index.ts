import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(process.cwd(), ".env") });


export default {
    port : process.env.PORT ?? "5000",
    database_url : process.env.DATABASE_URL,
    app_url : process.env.APP_URL,
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret : process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET!,
    jwt_refresh_secret : process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in : process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in : process.env.JWT_REFRESH_EXPIRES_IN!,
    stripe_product_price_id : process.env.STRIPE_PRODUCT_PRICE_ID!,
    stripe_secret_key : process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret : process.env.STRIPE_WEBHOOK_SECRET!,
    frontend_url: process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5000',
    sslcommerz_store_id: process.env.SSLCOMMERZ_STORE_ID!,
    sslcommerz_store_passwd: process.env.SSLCOMMERZ_STORE_PASSWD!,
    sslcommerz_is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    nodeEnv: process.env.NODE_ENV || 'development',
}