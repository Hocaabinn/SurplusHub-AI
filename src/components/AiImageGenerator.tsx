'use client';

import { useState } from 'react';
import {
    Sparkles,
    Crown,
    Wand2,
    Loader2,
    X,
    Check,
    Lock,
    Image as ImageIcon,
    RefreshCw,
    Download,
    Star,
    Zap,
} from 'lucide-react';

interface AiImageGeneratorProps {
    /** Whether the user has premium access */
    isPremium: boolean;
    /** Food title to generate image for */
    foodTitle: string;
    /** Callback when an image is generated/selected */
    onImageGenerated: (imageUrl: string, imageBlob: Blob) => void;
    /** Callback to open upgrade modal */
    onUpgradeClick: () => void;
}

// Predefined AI-generated food image styles
const STYLE_PRESETS = [
    { id: 'photo', label: 'Food Photo', icon: '📸', prompt: 'professional food photography' },
    { id: 'illustration', label: 'Illustration', icon: '🎨', prompt: 'watercolor food illustration' },
    { id: 'minimal', label: 'Minimal', icon: '⚪', prompt: 'minimal flat design' },
    { id: 'vibrant', label: 'Vibrant', icon: '🌈', prompt: 'vibrant colorful' },
];

/**
 * Generate a deterministic placeholder image based on food title
 * This creates a beautiful gradient canvas with the food name
 */
function generatePlaceholderImage(foodTitle: string, style: string): Promise<{ url: string; blob: Blob }> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d')!;

        // Generate color based on food title hash
        let hash = 0;
        for (let i = 0; i < foodTitle.length; i++) {
            const char = foodTitle.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        hash = Math.abs(hash); // Force positive to avoid negative radius later

        const hue1 = hash % 360;
        const hue2 = (hue1 + 40) % 360;
        const hue3 = (hue1 + 80) % 360;

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (style === 'minimal') {
            bgGrad.addColorStop(0, `hsl(${hue1}, 15%, 96%)`);
            bgGrad.addColorStop(1, `hsl(${hue2}, 20%, 92%)`);
        } else if (style === 'vibrant') {
            bgGrad.addColorStop(0, `hsl(${hue1}, 80%, 65%)`);
            bgGrad.addColorStop(0.5, `hsl(${hue2}, 75%, 55%)`);
            bgGrad.addColorStop(1, `hsl(${hue3}, 85%, 50%)`);
        } else {
            bgGrad.addColorStop(0, `hsl(${hue1}, 40%, 85%)`);
            bgGrad.addColorStop(1, `hsl(${hue2}, 50%, 75%)`);
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative circles
        for (let i = 0; i < 5; i++) {
            const x = (hash * (i + 1) * 137) % canvas.width;
            const y = (hash * (i + 1) * 97) % canvas.height;
            const r = 30 + (hash * (i + 1)) % 80;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(hue1 + i * 30) % 360}, 60%, 70%, 0.2)`;
            ctx.fill();
        }

        // Large centered circle (plate)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 20;
        const plateRadius = 150;

        // Plate shadow
        ctx.beginPath();
        ctx.arc(centerX + 5, centerY + 8, plateRadius + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fill();

        // Plate
        const plateGrad = ctx.createRadialGradient(centerX - 30, centerY - 30, 20, centerX, centerY, plateRadius);
        plateGrad.addColorStop(0, '#ffffff');
        plateGrad.addColorStop(1, '#f0f0f0');
        ctx.beginPath();
        ctx.arc(centerX, centerY, plateRadius, 0, Math.PI * 2);
        ctx.fillStyle = plateGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner plate ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, plateRadius - 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.03)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Food emoji in center
        const foodEmojis = ['🍛', '🍜', '🍲', '🍱', '🥘', '🍚', '🍝', '🥗', '🍕', '🍔', '🌮', '🥙'];
        const emojiIndex = Math.abs(hash) % foodEmojis.length;
        ctx.font = '80px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(foodEmojis[emojiIndex], centerX, centerY);

        // Food title at bottom
        ctx.font = 'bold 28px "Inter", "Outfit", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        if (style === 'vibrant') {
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
        } else if (style === 'minimal') {
            ctx.fillStyle = 'rgba(30,30,30,0.8)';
        } else {
            ctx.fillStyle = 'rgba(40,40,40,0.85)';
        }
        ctx.fillText(foodTitle, centerX, canvas.height - 50);

        // "AI Generated" watermark
        ctx.font = 'bold 12px "Inter", system-ui, sans-serif';
        ctx.fillStyle = style === 'vibrant' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('✨ AI Generated by PlateRescue', canvas.width - 20, canvas.height - 15);

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({ url, blob });
            }
        }, 'image/png', 0.95);
    });
}

export default function AiImageGenerator({
    isPremium,
    foodTitle,
    onImageGenerated,
    onUpgradeClick,
}: AiImageGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState('photo');
    const [generationCount, setGenerationCount] = useState(0);

    async function handleGenerate() {
        if (!isPremium) {
            onUpgradeClick();
            return;
        }

        if (!foodTitle.trim()) return;

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            // Simulate AI processing time
            await new Promise((res) => setTimeout(res, 1500 + Math.random() * 1000));

            const { url, blob } = await generatePlaceholderImage(
                foodTitle + (generationCount > 0 ? ` v${generationCount}` : ''),
                selectedStyle
            );

            setGeneratedImage(url);
            setGenerationCount((c) => c + 1);
            onImageGenerated(url, blob);
        } catch (err) {
            console.error('Image generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleRegenerate() {
        setGenerationCount((c) => c + 1);
        handleGenerate();
    }

    // Premium gate UI
    if (!isPremium) {
        return (
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5">
                {/* Decorative sparkles */}
                <div className="absolute -right-4 -top-4 text-5xl opacity-20 rotate-12">✨</div>
                <div className="absolute -bottom-2 -left-2 text-3xl opacity-15 -rotate-12">⭐</div>

                <div className="relative flex flex-col items-center gap-4 text-center">
                    {/* Premium crown icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                        <Crown className="h-7 w-7 text-white" />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            AI Image Generator
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                            Generate food images automatically with AI.
                            <br />
                            Premium-exclusive feature for <span className="font-semibold text-amber-600">Premium</span> members.
                        </p>
                    </div>

                    {/* Features list */}
                    <div className="flex flex-wrap justify-center gap-2 text-[10px] font-medium">
                        {['Auto Generate', 'Multi Style', 'Unlimited'].map((feat) => (
                            <span
                                key={feat}
                                className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-amber-700 shadow-sm"
                            >
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                {feat}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={onUpgradeClick}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98]"
                    >
                        <Crown className="h-4 w-4" />
                        Upgrade to Premium
                    </button>
                </div>
            </div>
        );
    }

    // Premium user UI
    return (
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-4">
            <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
                    <Wand2 className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900">AI Image Generator</h4>
                    <p className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
                        <Crown className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        Premium Feature
                    </p>
                </div>
            </div>



            {/* Generated image preview */}
            {generatedImage && (
                <div className="relative mb-3 overflow-hidden rounded-xl border border-purple-200 shadow-sm">
                    <img
                        src={generatedImage}
                        alt="AI Generated"
                        className="h-40 w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-white/80">
                            <Sparkles className="h-3 w-3" />
                            AI Generated
                        </span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleRegenerate}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                                title="Regenerate"
                            >
                                <RefreshCw className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Applied badge */}
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Check className="h-2.5 w-2.5" />
                        Applied
                    </div>
                </div>
            )}

            {/* Generate button */}
            <button
                onClick={generatedImage ? handleRegenerate : handleGenerate}
                disabled={isGenerating || !foodTitle.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating...
                    </>
                ) : generatedImage ? (
                    <>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerate Image
                    </>
                ) : (
                    <>
                        <Wand2 className="h-3.5 w-3.5" />
                        Generate AI Image
                    </>
                )}
            </button>

            {!foodTitle.trim() && (
                <p className="mt-1.5 text-center text-[10px] text-purple-400">
                    Enter a food name first to generate an image
                </p>
            )}
        </div>
    );
}
