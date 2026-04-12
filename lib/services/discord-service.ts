/**
 * 💬 DISCORD SERVICE
 * Integration with Discord webhooks for signal notifications
 */

import axios from 'axios';
import { TradingSignal, SignalType } from '@/lib/shared/trading/strategy-types';

/**
 * Configuration for the Discord service
 */
interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

/**
 * Service for sending trading signals to Discord
 */
export class DiscordService {
  private config: DiscordConfig;
  private static instance: DiscordService;

  private constructor(config: DiscordConfig) {
    this.config = config;
  }

  /**
   * Get the Discord service instance (singleton)
   */
  public static getInstance(config?: DiscordConfig): DiscordService {
    if (!DiscordService.instance) {
      // Default configuration from environment variables
      const defaultConfig: DiscordConfig = {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
        username: process.env.DISCORD_BOT_NAME || 'Nexural Trading Bot',
        avatarUrl: process.env.DISCORD_BOT_AVATAR || 'https://nexuraltrading.com/logo.png',
      };

      DiscordService.instance = new DiscordService(config || defaultConfig);
    }
    return DiscordService.instance;
  }

  /**
   * Send a trading signal to Discord
   */
  public async sendSignal(signal: TradingSignal): Promise<boolean> {
    try {
      if (!this.config.webhookUrl) {
        console.error('Discord webhook URL not configured');
        return false;
      }

      // Format timestamp
      const timestamp = new Date(signal.timestamp).toISOString();
      
      // Determine color based on signal type
      let color = 0x00ff00; // Green for LONG
      if (signal.type === SignalType.SHORT) {
        color = 0xff0000; // Red for SHORT
      } else if (signal.type === SignalType.EXIT) {
        color = 0xffff00; // Yellow for EXIT
      } else if (signal.type === SignalType.NEUTRAL) {
        color = 0x808080; // Gray for NEUTRAL
      }

      // Create embed for Discord message
      const embed = {
        title: `${signal.type} Signal: ${signal.instrumentId}`,
        color: color,
        timestamp: timestamp,
        fields: [
          {
            name: 'Strategy',
            value: signal.strategyId,
            inline: true,
          },
          {
            name: 'Confidence',
            value: `${(signal.confidence * 100).toFixed(2)}%`,
            inline: true,
          },
        ],
        footer: {
          text: 'Nexural Trading',
          icon_url: 'https://nexuraltrading.com/favicon.ico',
        },
      };

      // Add price information if available
      if (signal.price) {
        embed.fields.push({
          name: 'Price',
          value: signal.price.toString(),
          inline: true,
        });
      }

      // Add target price if available
      if (signal.targetPrice) {
        embed.fields.push({
          name: 'Target',
          value: signal.targetPrice.toString(),
          inline: true,
        });
      }

      // Add stop price if available
      if (signal.stopPrice) {
        embed.fields.push({
          name: 'Stop',
          value: signal.stopPrice.toString(),
          inline: true,
        });
      }

      // Add additional metadata
      if (signal.metadata) {
        for (const [key, value] of Object.entries(signal.metadata)) {
          if (typeof value !== 'object') {
            embed.fields.push({
              name: key,
              value: value.toString(),
              inline: false,
            });
          }
        }
      }

      // Send message to Discord webhook
      const response = await axios.post(this.config.webhookUrl, {
        username: this.config.username,
        avatar_url: this.config.avatarUrl,
        embeds: [embed],
      });

      return response.status === 204;
    } catch (error) {
      console.error('Error sending signal to Discord:', error);
      return false;
    }
  }

  /**
   * Send a plain text message to Discord
   */
  public async sendMessage(message: string): Promise<boolean> {
    try {
      if (!this.config.webhookUrl) {
        console.error('Discord webhook URL not configured');
        return false;
      }

      // Send message to Discord webhook
      const response = await axios.post(this.config.webhookUrl, {
        username: this.config.username,
        avatar_url: this.config.avatarUrl,
        content: message,
      });

      return response.status === 204;
    } catch (error) {
      console.error('Error sending message to Discord:', error);
      return false;
    }
  }

  /**
   * Send a system notification to Discord
   */
  public async sendSystemNotification(title: string, message: string, isError: boolean = false): Promise<boolean> {
    try {
      if (!this.config.webhookUrl) {
        console.error('Discord webhook URL not configured');
        return false;
      }

      // Create embed for Discord message
      const embed = {
        title: title,
        description: message,
        color: isError ? 0xff0000 : 0x0099ff, // Red for errors, blue for normal
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Nexural Trading System',
          icon_url: 'https://nexuraltrading.com/favicon.ico',
        },
      };

      // Send message to Discord webhook
      const response = await axios.post(this.config.webhookUrl, {
        username: this.config.username,
        avatar_url: this.config.avatarUrl,
        embeds: [embed],
      });

      return response.status === 204;
    } catch (error) {
      console.error('Error sending system notification to Discord:', error);
      return false;
    }
  }
}

// Export a default instance
const discordService = DiscordService.getInstance();
export default discordService;
