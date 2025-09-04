import React from 'react';
import { motion } from 'framer-motion';
import { SnapQuizLogo } from './SnapQuizLogo';
import { QRCodeSection } from './QRCodeSection';
import { PageLayout, FadeIn, ScaleIn } from './layout';

interface GamePageProps {
  roomId: string;
}

export const GamePage: React.FC<GamePageProps> = ({
  roomId
}) => {
  return (
    <PageLayout 
      className="text-center flex flex-col justify-center items-center flex-1 min-h-full"
      maxWidth="full"
      center={false}
      padding="none"
    >
      <ScaleIn delay={0.1} scale={0.8} duration={0.3}>
        <div className="mb-8 flex justify-center items-center">
          <SnapQuizLogo size='40svh' />
        </div>
      </ScaleIn>
      
      <FadeIn direction="up" delay={0.3}>
        <QRCodeSection roomId={roomId} />
      </FadeIn>
    </PageLayout>
  );
};
