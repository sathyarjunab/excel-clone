import { Pool } from "pg";

const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });

export default dbPool;
