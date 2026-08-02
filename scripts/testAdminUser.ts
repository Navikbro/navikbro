import { addUserToAdminCache } from "@/services/admin/adminUserService";


async function test() {

    await addUserToAdminCache({

        uid: "test-user-001",

        name: "Test Student",

        email: "test@student.com",

        plan: "free",

        status: "active",

        endDate: null,

        photoURL: null,

        isBlocked: false,

    });


    console.log("Test user added to admin cache");

    process.exit(0);
}


test();