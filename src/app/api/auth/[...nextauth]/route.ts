import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsers } from "@/lib/usersDB";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1️⃣ Ensure credentials exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const users = getUsers();

        // 2️⃣ Find the user by email
        const user = users.find(u => u.email === credentials.email);
        if (!user) throw new Error("Invalid email or password");

        // 3️⃣ Compare plain password with hashed password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        // 4️⃣ Return a user object that NextAuth expects
        return {
          id: user.email, // optional, must be unique
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
