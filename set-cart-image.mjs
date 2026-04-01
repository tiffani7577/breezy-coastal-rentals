import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const CDN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413300520/7hUDh8nJHPTxQ2ComhxGSN/cart-luxury-6seat_3a62c025.png";

const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id FROM pricing LIMIT 1");
if (rows.length > 0) {
  await conn.execute("UPDATE pricing SET cartImageUrl = ? WHERE id = ?", [CDN_URL, rows[0].id]);
  console.log("Cart image updated for existing row, id:", rows[0].id);
} else {
  await conn.execute(
    "INSERT INTO pricing (dailyRate, deliveryFee, cartName, cartDescription, cartImageUrl) VALUES (170.00, 0.00, 'Breezy Golf Cart', '6-passenger luxury electric golf cart', ?)",
    [CDN_URL]
  );
  console.log("Inserted new pricing row with cart image.");
}
await conn.end();
console.log("Done.");
