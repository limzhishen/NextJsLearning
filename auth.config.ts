import { url } from "inspector";
import type { NextAuthConfig } from "next-auth";
import { signIn } from "next-auth/react";

export const authConfig={
    pages:{
        signIn:'/login'
    },
    callbacks:{
        authorized({auth,request:{nextUrl}}){
            const isLogin=!!auth?.user
            const isOnDashboard=nextUrl.pathname.startsWith('/dashboard')
            if(isOnDashboard){
                if(isLogin)return true;
                return false
            }else if (isLogin){
                return Response.redirect(new URL('/dashboard',nextUrl))
            }
            return true
        }
    },
    providers:[]
}satisfies NextAuthConfig;