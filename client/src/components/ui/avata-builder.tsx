import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AvatarBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarData: AvatarConfig) => void;
  currentAvatar?: string;
}

interface AvatarConfig {
  gender: 'girl' | 'boy';
  hair: string;
  clothing: string;
  laptop: string;
  accessories: string;
  style: string;
}

const avatarOptions = {
  prebuilt: [
    { id: 'girl-purple', name: 'Purple Coder Girl', src: '/attached_assets/generated_images/Girl_programmer_purple_hoodie_3b72604d.png', gender: 'girl' },
    { id: 'boy-blue', name: 'Robot Boy Coder', src: '/attached_assets/generated_images/Boy_programmer_blue_robot_shirt_604dd7c8.png', gender: 'boy' },
    { id: 'girl-pink', name: 'Pink Gamer Girl', src: '/attached_assets/generated_images/Girl_programmer_pink_gamer_style_bd054454.png', gender: 'girl' },
    { id: 'boy-green', name: 'Circuit Boy Coder', src: '/attached_assets/generated_images/Boy_programmer_green_circuit_hoodie_b51c7c42.png', gender: 'boy' },
    { id: 'girl-red', name: 'HTML Girl Coder', src: '/attached_assets/generated_images/Girl_programmer_red_HTML_shirt_a48ec1c3.png', gender: 'girl' },
    { id: 'boy-yellow', name: 'JavaScript Boy Coder', src: '/attached_assets/generated_images/Boy_programmer_yellow_JavaScript_hoodie_933d4439.png', gender: 'boy' }
  ],
  clothing: {
    girl: [
      { id: 'hoodie-purple', name: 'Purple Code Hoodie', emoji: '💜', color: 'purple' },
      { id: 'shirt-pink', name: 'Pink Gamer Shirt', emoji: '🌸', color: 'pink' },
      { id: 'shirt-red', name: 'HTML Red Shirt', emoji: '❤️', color: 'red' },
      { id: 'hoodie-blue', name: 'Blue Tech Hoodie', emoji: '💙', color: 'blue' },
      { id: 'shirt-green', name: 'Green Code Shirt', emoji: '💚', color: 'green' },
      { id: 'dress-yellow', name: 'Yellow Code Dress', emoji: '💛', color: 'yellow' }
    ],
    boy: [
      { id: 'hoodie-blue', name: 'Blue Robot Hoodie', emoji: '🤖', color: 'blue' },
      { id: 'shirt-green', name: 'Circuit Green Shirt', emoji: '⚡', color: 'green' },
      { id: 'hoodie-yellow', name: 'JS Yellow Hoodie', emoji: '⚡', color: 'yellow' },
      { id: 'shirt-red', name: 'Python Red Shirt', emoji: '🐍', color: 'red' },
      { id: 'hoodie-purple', name: 'Purple Code Hoodie', emoji: '💜', color: 'purple' },
      { id: 'shirt-orange', name: 'Orange HTML Shirt', emoji: '🧡', color: 'orange' }
    ]
  },
  hair: {
    girl: [
      { id: 'long-braids', name: 'Long Braids', emoji: '👧🏻', style: 'braided' },
      { id: 'short-bob', name: 'Short Bob', emoji: '👩🏻', style: 'bob' },
      { id: 'long-straight', name: 'Long Straight', emoji: '👱🏻‍♀️', style: 'straight' },
      { id: 'curly-long', name: 'Curly Long', emoji: '👩🏻‍🦱', style: 'curly' },
      { id: 'ponytail', name: 'High Ponytail', emoji: '🎀', style: 'ponytail' },
      { id: 'pigtails', name: 'Twin Pigtails', emoji: '🎈', style: 'pigtails' }
    ],
    boy: [
      { id: 'short-messy', name: 'Messy Hair', emoji: '👦🏻', style: 'messy' },
      { id: 'curly-short', name: 'Curly Hair', emoji: '👨🏻‍🦱', style: 'curly' },
      { id: 'spiky', name: 'Spiky Hair', emoji: '⚡', style: 'spiky' },
      { id: 'buzz-cut', name: 'Buzz Cut', emoji: '👨🏻‍🦲', style: 'buzzcut' },
      { id: 'side-part', name: 'Side Part', emoji: '💼', style: 'sidepart' },
      { id: 'mohawk', name: 'Cool Mohawk', emoji: '🦅', style: 'mohawk' }
    ]
  },
  laptops: [
    { id: 'macbook', name: 'MacBook', emoji: '💻', brand: 'apple' },
    { id: 'gaming-laptop', name: 'Gaming Laptop', emoji: '🎮', brand: 'gaming' },
    { id: 'colorful-laptop', name: 'Colorful Laptop', emoji: '🌈', brand: 'colorful' },
    { id: 'tablet', name: 'Coding Tablet', emoji: '📱', brand: 'tablet' },
    { id: 'desktop', name: 'Cool Desktop', emoji: '🖥️', brand: 'desktop' },
    { id: 'raspberry-pi', name: 'Raspberry Pi', emoji: '🍓', brand: 'mini' }
  ],
  accessories: [
    { id: 'glasses', name: 'Smart Glasses', emoji: '🤓' },
    { id: 'headphones', name: 'Cool Headphones', emoji: '🎧' },
    { id: 'sunglasses', name: 'Cool Sunglasses', emoji: '😎' },
    { id: 'hat', name: 'Coding Cap', emoji: '🧢' },
    { id: 'bow', name: 'Hair Bow', emoji: '🎀' },
    { id: 'none', name: 'No Accessories', emoji: '✨' }
  ]
};

export default function AvatarBuilder({ isOpen, onClose, onSave, currentAvatar }: AvatarBuilderProps) {
  const [selectedTab, setSelectedTab] = useState("prebuilt");
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    gender: 'girl',
    hair: 'long-braids',
    clothing: 'hoodie-purple',
    laptop: 'macbook',
    accessories: 'glasses',
    style: 'kawaii'
  });

  const handlePrebuiltSelect = (avatar: any) => {
    setSelectedPrebuilt(avatar.id);
  };

  const handleConfigChange = (category: keyof AvatarConfig, value: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    if (selectedTab === 'prebuilt' && selectedPrebuilt) {
      const selected = avatarOptions.prebuilt.find(a => a.id === selectedPrebuilt);
      if (selected) {
        onSave({
          gender: selected.gender as 'girl' | 'boy',
          hair: '',
          clothing: '',
          laptop: '',
          accessories: '',
          style: selected.src
        });
      }
    } else {
      onSave(avatarConfig);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">✨ O'zingizga Avatar Yarating! ✨</DialogTitle>
          <p className="text-center text-gray-600">Dasturchi avatarini tanlang yoki o'zingiznikini yarating</p>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prebuilt" className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Tayyor avatarlar</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <span>🛠️</span>
              <span>O'zim yarataman</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prebuilt" className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">Quyidagi tayyor avatarlardan birini tanlang:</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {avatarOptions.prebuilt.map((avatar) => (
                <Card
                  key={avatar.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPrebuilt === avatar.id
                      ? 'ring-2 ring-teens-green bg-green-50'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handlePrebuiltSelect(avatar)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="relative mb-3">
                      <img
                        src={avatar.src}
                        alt={avatar.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-200"
                      />
                      <Badge
                        variant="secondary"
                        className={`absolute -top-2 -right-2 ${
                          avatar.gender === 'girl' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {avatar.gender === 'girl' ? '👧' : '👦'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{avatar.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-gray-600">O'z avatarringizni yarating - har bir tafsilotni tanlang:</p>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>👤</span>
                <span>Jins tanglang:</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    avatarConfig.gender === 'girl'
                      ? 'ring-2 ring-pink-400 bg-pink-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleConfigChange('gender', 'girl')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">👧</div>
                    <span className="font-medium">Qiz</span>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    avatarConfig.gender === 'boy'
                      ? 'ring-2 ring-blue-400 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleConfigChange('gender', 'boy')}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">👦</div>
                    <span className="font-medium">O'g'il bola</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Hair Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>💇</span>
                <span>Soch turini tanlang:</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.hair[avatarConfig.gender].map((hair) => (
                  <Card
                    key={hair.id}
                    className={`cursor-pointer transition-all ${
                      avatarConfig.hair === hair.id
                        ? 'ring-2 ring-purple-400 bg-purple-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleConfigChange('hair', hair.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-1">{hair.emoji}</div>
                      <span className="text-xs font-medium">{hair.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Clothing Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>👕</span>
                <span>Kiyim tanlang:</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.clothing[avatarConfig.gender].map((clothing) => (
                  <Card
                    key={clothing.id}
                    className={`cursor-pointer transition-all ${
                      avatarConfig.clothing === clothing.id
                        ? 'ring-2 ring-green-400 bg-green-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleConfigChange('clothing', clothing.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-1">{clothing.emoji}</div>
                      <span className="text-xs font-medium">{clothing.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Laptop Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>💻</span>
                <span>Laptop tanlang:</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.laptops.map((laptop) => (
                  <Card
                    key={laptop.id}
                    className={`cursor-pointer transition-all ${
                      avatarConfig.laptop === laptop.id
                        ? 'ring-2 ring-blue-400 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleConfigChange('laptop', laptop.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-1">{laptop.emoji}</div>
                      <span className="text-xs font-medium">{laptop.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Accessories Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>🎭</span>
                <span>Aksessuar tanlang:</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.accessories.map((accessory) => (
                  <Card
                    key={accessory.id}
                    className={`cursor-pointer transition-all ${
                      avatarConfig.accessories === accessory.id
                        ? 'ring-2 ring-yellow-400 bg-yellow-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleConfigChange('accessories', accessory.id)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-1">{accessory.emoji}</div>
                      <span className="text-xs font-medium">{accessory.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            ❌ Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedTab === 'prebuilt' && !selectedPrebuilt}
            className="flex-1 bg-gradient-to-r from-teens-green to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold"
          >
            {selectedTab === 'prebuilt' ? '🎉 Avatar tanlash!' : '🚀 Avatar yaratish!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
