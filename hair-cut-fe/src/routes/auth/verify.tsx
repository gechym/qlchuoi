 import { createFileRoute } from '@tanstack/react-router'
 import EmailVerification from '../../components/auth/EmailVerification'

 export const Route = createFileRoute('/auth/verify')({
   component: EmailVerification,
 }) 