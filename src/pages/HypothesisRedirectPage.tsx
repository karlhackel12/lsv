
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HypothesisRedirectPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the problem validation page by default
    navigate('/dashboard/problem-validation');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to hypothesis page...</p>
    </div>
  );
};

export default HypothesisRedirectPage;
