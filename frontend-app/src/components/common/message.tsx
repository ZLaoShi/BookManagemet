import { useEffect } from 'react';
import { Callout } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import './message.scss';

interface MessageProps {
  type: 'success' | 'error';
  message: string;
  open: boolean;
  onClose: () => void;
  duration?: number;
}

export const Message = ({ 
  type, 
  message, 
  open, 
  onClose, 
  duration = 3000 
}: MessageProps) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="message-container">
      <Callout.Root 
        color={type === 'success' ? 'blue' : 'red'} 
        role="alert"
        className="message-callout"
      >
        <Callout.Icon>
          {type === 'success' ? <CheckCircledIcon /> : <CrossCircledIcon />}
        </Callout.Icon>
        <Callout.Text>{message}</Callout.Text>
      </Callout.Root>
    </div>
  );
};