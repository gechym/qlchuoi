 import React, { useState, useEffect } from 'react'
 import { Card, Input, Button, message, Typography, Space, Divider } from 'antd'
 import { MailOutlined, SafetyOutlined } from '@ant-design/icons'
 import { useSearchParams, useNavigate } from '@tanstack/react-router'

 const { Title, Text } = Typography

 interface EmailVerificationProps {
   email?: string
   onVerificationSuccess?: () => void
 }

 const EmailVerification: React.FC<EmailVerificationProps> = ({
   email: propEmail,
   onVerificationSuccess,
 }) => {
   const [searchParams] = useSearchParams()
   const navigate = useNavigate()
   const [loading, setLoading] = useState(false)
   const [resendLoading, setResendLoading] = useState(false)
   const [code, setCode] = useState('')
   const [countdown, setCountdown] = useState(0)

   // Lấy email từ props hoặc URL params
   const email = propEmail || searchParams.get('email') || ''
   const urlCode = searchParams.get('code') || ''

   // Auto-fill code nếu có trong URL
   useEffect(() => {
     if (urlCode) {
       setCode(urlCode)
       handleVerify(urlCode)
     }
   }, [urlCode])

   // Countdown timer
   useEffect(() => {
     if (countdown > 0) {
       const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
       return () => clearTimeout(timer)
     }
   }, [countdown])

   const handleVerify = async (verificationCode?: string) => {
     const codeToVerify = verificationCode || code
     if (!codeToVerify.trim()) {
       message.error('Vui lòng nhập mã xác thực')
       return
     }

     setLoading(true)
     try {
       const response = await fetch('/api/auth/verify-email', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           email,
           code: codeToVerify,
         }),
       })

       const data = await response.json()

       if (response.ok) {
         message.success('Xác thực email thành công!')
         onVerificationSuccess?.()
         // Redirect về trang login hoặc dashboard
         navigate({ to: '/login' })
       } else {
         message.error(data.message || 'Có lỗi xảy ra')
       }
     } catch (error) {
       message.error('Có lỗi xảy ra khi xác thực')
     } finally {
       setLoading(false)
     }
   }

   const handleResendCode = async () => {
     setResendLoading(true)
     try {
       const response = await fetch('/api/auth/resend-verification', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email }),
       })

       const data = await response.json()

       if (response.ok) {
         message.success('Đã gửi lại mã xác thực!')
         setCountdown(60) // 60 giây countdown
       } else {
         message.error(data.message || 'Có lỗi xảy ra')
       }
     } catch (error) {
       message.error('Có lỗi xảy ra khi gửi lại mã')
     } finally {
       setResendLoading(false)
     }
   }

   return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
       <Card className="w-full max-w-md">
         <div className="text-center mb-6">
           <MailOutlined className="text-4xl text-blue-500 mb-4" />
           <Title level={3}>Xác thực Email</Title>
           <Text type="secondary">Chúng tôi đã gửi mã xác thực đến email:</Text>
           <div className="mt-2">
             <Text strong className="text-blue-600">
               {email}
             </Text>
           </div>
         </div>

         <Space direction="vertical" className="w-full" size="large">
           <div>
             <Text className="block mb-2">Nhập mã xác thực (6 chữ số):</Text>
             <Input
               size="large"
               value={code}
               onChange={(e) =>
                 setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
               }
               placeholder="Nhập mã 6 số"
               prefix={<SafetyOutlined />}
               maxLength={6}
               className="text-center text-xl tracking-widest"
             />
           </div>

           <Button
             type="primary"
             size="large"
             loading={loading}
             onClick={() => handleVerify()}
             className="w-full"
             disabled={code.length !== 6}
           >
             Xác thực
           </Button>

           <Divider>hoặc</Divider>

           <div className="text-center">
             <Text type="secondary" className="block mb-2">
               Không nhận được mã?
             </Text>
             <Button
               type="link"
               loading={resendLoading}
               onClick={handleResendCode}
               disabled={countdown > 0}
               className="p-0"
             >
               {countdown > 0
                 ? `Gửi lại sau ${countdown}s`
                 : 'Gửi lại mã xác thực'}
             </Button>
           </div>
         </Space>
       </Card>
     </div>
   )
 }

 export default EmailVerification 