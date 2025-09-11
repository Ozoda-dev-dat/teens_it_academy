import React from 'react';

interface AvatarConfig {
  gender: 'girl' | 'boy';
  hair: string;
  clothing: string;
  laptop: string;
  accessories: string;
  style: string;
}

interface AvatarRendererProps {
  avatarConfig: AvatarConfig;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getEmojiForConfig = (config: AvatarConfig) => {
  const { gender, hair, clothing, accessories } = config;
  
  // Base character based on gender
  let baseEmoji = gender === 'girl' ? '👧' : '👦';
  
  // Hair modifications
  if (hair.includes('curly')) {
    baseEmoji = gender === 'girl' ? '👩🏻‍🦱' : '👨🏻‍🦱';
  } else if (hair.includes('long') || hair.includes('braids')) {
    baseEmoji = gender === 'girl' ? '👱🏻‍♀️' : '👨🏻';
  }
  
  return baseEmoji;
};

const getStyleElements = (config: AvatarConfig) => {
  const elements = [];
  
  // Clothing color
  const clothingColors = {
    'purple': '#8B5CF6',
    'pink': '#EC4899', 
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'orange': '#F97316'
  };
  
  let clothingColor = '#3B82F6'; // default blue
  Object.keys(clothingColors).forEach(color => {
    if (config.clothing.includes(color)) {
      clothingColor = clothingColors[color as keyof typeof clothingColors];
    }
  });
  
  // Laptop emoji
  const laptopEmojis = {
    'macbook': '💻',
    'gaming': '🎮',
    'colorful': '🌈',
    'tablet': '📱',
    'desktop': '🖥️',
    'raspberry': '🍓'
  };
  
  let laptopEmoji = '💻';
  Object.keys(laptopEmojis).forEach(type => {
    if (config.laptop.includes(type)) {
      laptopEmoji = laptopEmojis[type as keyof typeof laptopEmojis];
    }
  });
  
  // Accessories emoji
  const accessoryEmojis = {
    'glasses': '🤓',
    'headphones': '🎧',
    'sunglasses': '😎',
    'hat': '🧢',
    'bow': '🎀',
    'none': ''
  };
  
  let accessoryEmoji = '';
  Object.keys(accessoryEmojis).forEach(type => {
    if (config.accessories.includes(type)) {
      accessoryEmoji = accessoryEmojis[type as keyof typeof accessoryEmojis];
    }
  });
  
  return { clothingColor, laptopEmoji, accessoryEmoji };
};

export default function AvatarRenderer({ avatarConfig, size = 'md', className = '' }: AvatarRendererProps) {
  const baseEmoji = getEmojiForConfig(avatarConfig);
  const { clothingColor, laptopEmoji, accessoryEmoji } = getStyleElements(avatarConfig);
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-6xl'
  };
  
  const badgeSizes = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Main avatar with clothing color background */}
      <div 
        className="w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-lg relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${clothingColor}, ${clothingColor}dd)` 
        }}
      >
        <span className="relative z-10">{baseEmoji}</span>
        
        {/* Clothing pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
                             radial-gradient(circle at 80% 50%, white 2px, transparent 2px)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
      </div>
      
      {/* Accessory badge */}
      {accessoryEmoji && (
        <div className={`absolute -top-1 -right-1 ${badgeSizes[size]} bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm`}>
          <span>{accessoryEmoji}</span>
        </div>
      )}
      
      {/* Laptop badge */}
      <div className={`absolute -bottom-1 -right-1 ${badgeSizes[size]} bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm`}>
        <span>{laptopEmoji}</span>
      </div>
      
      {/* Coding sparkle effect */}
      <div className="absolute -top-2 -left-2 text-yellow-400 animate-pulse">
        <span className="text-xs">⚡</span>
      </div>
    </div>
  );
}
