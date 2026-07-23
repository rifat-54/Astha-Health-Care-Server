import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVeriable } from "../config/env";

const getAccessToken=(payload:JwtPayload)=>{
    const accesstoken=jwtUtils.createToken(payload,envVeriable.ACCESS_TOKEN_SECRET,{expiresIn:envVeriable.ACCESS_TOKEN_EXPIRE_IN} as SignOptions)

    return accesstoken;
}

const getRefreshToken=(payload:JwtPayload)=>{
    const refreshtoken=jwtUtils.createToken(payload,envVeriable.REFRESH_TOKEN_SECRET,{expiresIn:envVeriable.REFRESH_TOKEN_EXPIRE_IN} as SignOptions)

    return refreshtoken
}

export const tokenUtils={
    getAccessToken,
    getRefreshToken
}