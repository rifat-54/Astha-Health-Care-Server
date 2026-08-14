import app from "./app";
import { seedSuperAdmin } from "./app/utils/seed";

const main = async() => {
    try {
        await seedSuperAdmin()

        app.listen(5000, () => {
            console.log(`Server is running on http://localhost:5000`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

main();