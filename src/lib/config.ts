const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error("JWT_SECRET 环境变量未设置");
}

export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
