
export const authConfig = {
    pages: {
        signIn: "/",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role
                session.user.id = token.id
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unhenticated users to login page
            } else if (isLoggedIn) {
                // return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
    },
    providers: [], // Configured in auth.js
}
