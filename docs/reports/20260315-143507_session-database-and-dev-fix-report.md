# Session Report: Database Research and Dev Startup Fix

This report summarizes the work completed in this session:

- research of the repository database setup and operations
- diagnosis and resolution of the `npm run dev` startup error

## 1) Database setup in this repository

- ORM: Prisma (`prisma`, `@prisma/client`)
- Database engine: SQLite
- Prisma schema: `prisma/schema.prisma`
- Prisma config: `prisma.config.ts`
- Environment variable: `.env` with `DATABASE_URL="file:./dev.db"`
- SQLite file path (resolved from the URL): `prisma/dev.db`

### Current models (from `prisma/schema.prisma`)

- `User`
- `UserRole` (`Role` enum: `BUYER`, `SELLER`)
- `Product`
- `Order`
- `OrderItem`

## 2) Practical database operations

### View schema

```bash
# Open Prisma schema
cat prisma/schema.prisma
```

### View and edit records (GUI)

```bash
npx prisma studio
```

### Initialize database from schema + seed

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Query records (application-level via Prisma Client)

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{console.log(await p.user.findMany({select:{id:true,email:true,name:true},orderBy:{email:'asc'}}));})().finally(()=>p.$disconnect())"
```

### Inspect table list and row counts (SQL through Prisma)

```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const t=await p.$queryRawUnsafe(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\");console.log(t);for(const x of t){const c=await p.$queryRawUnsafe(\`SELECT COUNT(*) AS count FROM \\\"${x.name}\\\"\`);console.log(x.name,c[0]);}})().finally(()=>p.$disconnect())"
```

### Execute raw SQL script (writes/admin SQL)

```bash
echo "DELETE FROM \"OrderItem\";" | npx prisma db execute --stdin --schema prisma/schema.prisma
```

> Note: `prisma db execute` is intended for execution (success/failure), not for returning query result sets.

### Reset database (destructive)

```bash
npx prisma migrate reset --force
```

### Drop database file and recreate (destructive)

```bash
rm -f prisma/dev.db
npx prisma db push
npx prisma db seed
```

## 3) `npm run dev` issue and fix

### Symptom

Running `npm run dev` failed with:

- `Unable to acquire lock at .next/dev/lock`
- message indicated another `next dev` instance was running

### Root cause

A stale `next dev` process was active and holding the development lock file.

### Fix performed

- identified running Next.js process
- stopped that process
- removed stale lock file
- restarted `npm run dev` and verified successful startup

### Current behavior

- app starts successfully
- port `3000` is already occupied by another process in this environment, so Next.js auto-falls back to `3001`

## 4) Validation summary

- `npm run build`: passes
- `npm run lint`: fails due to pre-existing baseline lint issues unrelated to this session's fix
- `npx vitest --run`: fails due to pre-existing baseline test configuration/test issues unrelated to this session's fix
