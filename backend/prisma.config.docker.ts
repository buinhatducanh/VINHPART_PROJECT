import { defineConfig } from '@prisma/config';

export default defineConfig({
    datasource: {
        url: "postgresql://postgres:password@postgres:5432/vinpart?schema=public",
    },
});
