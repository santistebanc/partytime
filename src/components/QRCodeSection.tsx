import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeSectionProps {
  roomId: string;
}

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ 
  roomId
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate QR code for the room
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const roomUrl = `${window.location.origin}?roomId=${roomId}`;
        const qrDataUrl = await QRCode.toDataURL(roomUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#2C3E3D',
            light: '#7A8A89'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (roomId) {
      generateQRCode();
    }
  }, [roomId]);

  const handleCopyRoomUrl = async () => {
    try {
      const roomUrl = `${window.location.origin}?roomId=${roomId}`;
      await navigator.clipboard.writeText(roomUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <motion.div 
      className="qr-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.2 }}
    >
      <h3>Join this room on mobile:</h3>
      <div className="qr-code">
        {qrCodeDataUrl ? (
          <motion.div 
            className="qr-code-container clickable"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyRoomUrl}
            title="Click to copy room URL"
          >
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code to join this room (click to copy URL)"
              className="qr-code-image"
            />
          </motion.div>
        ) : (
          <motion.div 
            className="qr-loading"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <QrCode size={80} color="#2C3E3D" />
            <span>Generating QR Code...</span>
          </motion.div>
        )}
        {showCopiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="copied-message"
          >
            ✓ Room URL copied to clipboard!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
