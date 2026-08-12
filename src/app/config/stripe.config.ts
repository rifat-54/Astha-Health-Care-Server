import Stripe from "stripe";
import { envVeriable } from "./env";

export const stripe=new Stripe(envVeriable.STRIPE.STRIPE_SECRET_KEY)