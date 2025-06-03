import React, { useState } from 'react';
import { Form, message } from 'antd';
import EmailVerification from './EmailVerification';

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'Đăng ký thành công!');
        setRegisteredEmail(values.email);
        setShowVerification(true);
      } else {
        message.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <EmailVerification 
        email={registeredEmail}
        onVerificationSuccess={() => {
          // Handle success, maybe redirect to login
        }}
      />
    );
  }

  return <RegisterForm />;
};

export default Register; 