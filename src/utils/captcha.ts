/**
 * CAPTCHA Generation System for DevHub Bot
 * Created by AlexM (https://github.com/ThisDudeBoy)
 * 
 * Generates visual CAPTCHAs to verify new members are human.
 * Uses HTML5 Canvas to create images with distorted text.
 */

import { createCanvas } from 'canvas';

export interface CaptchaData {
    text: string;    // The correct answer (5 characters)
    buffer: Buffer;  // PNG image buffer for Discord
}

/**
 * Generate a visual CAPTCHA challenge with random text and visual noise
 * @returns CaptchaData containing the answer and image buffer
 */
export function generateCaptcha(): CaptchaData {
    // Create random 5-character challenge using uppercase letters and numbers
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create canvas
    const canvas = createCanvas(200, 80);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 80);

    // Add noise lines
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 80);
        ctx.lineTo(Math.random() * 200, Math.random() * 80);
        ctx.stroke();
    }

    // Add noise dots
    ctx.fillStyle = '#999';
    for (let i = 0; i < 30; i++) {
        ctx.fillRect(Math.random() * 200, Math.random() * 80, 2, 2);
    }

    // Draw text with random colors and positions
    ctx.font = 'bold 30px Arial';
    for (let i = 0; i < text.length; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
        const x = 20 + i * 30 + Math.random() * 10;
        const y = 40 + Math.random() * 20;
        const angle = (Math.random() - 0.5) * 0.4;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
    }

    return {
        text,
        buffer: canvas.toBuffer('image/png')
    };
}