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
            dark: '#000000',
            light: '#ffffff'
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
      className="mt-10 mb-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.2 }}
    >
      <h3 className="mb-5 text-gray-600 text-xl">Join this room on mobile:</h3>
      {qrCodeDataUrl ? (
        <motion.div 
          className="my-5 p-5 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyRoomUrl}
          title="Click to copy room URL"
        >
          <img 
            src={qrCodeDataUrl} 
            alt="QR Code to join this room (click to copy URL)"
            className="w-48 h-48 mx-auto object-contain p-2.5"
          />
        </motion.div>
      ) : (
        <motion.div 
          className="w-48 h-48 mx-auto flex flex-col items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <QrCode size={80} color="#495057" />
          <span className="text-gray-500 mt-2">Generating QR Code...</span>
        </motion.div>
      )}
      {showCopiedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mt-4 px-4 py-2 bg-blue-50 text-gray-600 rounded-lg"
        >
          ✓ Room URL copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  );
};
