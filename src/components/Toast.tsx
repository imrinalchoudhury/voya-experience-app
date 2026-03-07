import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-[#0C0A07] border border-[rgba(201,169,110,0.4)] rounded-lg px-6 py-3 shadow-xl">
        <p className="text-[#C9A96E]" style={{ fontFamily: 'Cormorant Garamond', fontSize: '15px' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
