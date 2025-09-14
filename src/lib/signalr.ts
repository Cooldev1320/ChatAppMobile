import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../types/auth';
import { ENV } from '../config/environment';

class SignalRService {
  private connection: HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;

  async connect(token: string): Promise<void> {
    if (this.isConnecting || this.connectionPromise) {
      return this.connectionPromise || Promise.resolve();
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.connectionPromise = this._doConnect(token);
    
    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async _doConnect(token: string): Promise<void> {
    if (!token || token.trim() === '') {
      throw new Error('Invalid token provided for SignalR connection');
    }

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.log('Error stopping existing connection:', error);
      }
      this.connection = null;
    }

    console.log('Attempting to connect to SignalR with token:', token.substring(0, 20) + '...');

    const signalRUrl = ENV.SIGNALR_URL;
    console.log('SignalR URL:', signalRUrl);
    
    // Try different transport configurations for React Native compatibility
    const transportConfigs = [
      { skipNegotiation: true, transport: 1 }, // WebSockets only
      { skipNegotiation: false, transport: undefined }, // Let SignalR choose
      { skipNegotiation: true, transport: 0 }, // Server-Sent Events
    ];

    let lastError: any = null;
    
    for (let i = 0; i < transportConfigs.length; i++) {
      const config = transportConfigs[i];
      console.log(`Trying transport configuration ${i + 1}/${transportConfigs.length}:`, config);
      
      try {
        this.connection = new HubConnectionBuilder()
          .withUrl(signalRUrl, {
            accessTokenFactory: () => token,
            ...config
          })
          .withAutomaticReconnect([0, 2000, 10000, 30000])
          .configureLogging(LogLevel.None) // Disable logging to avoid pathname issues
          .build();

        this.connection.onreconnecting(() => {
          console.log('SignalR reconnecting...');
        });

        this.connection.onreconnected(() => {
          console.log('SignalR reconnected');
        });

        this.connection.onclose((error) => {
          if (error) {
            console.error('SignalR connection closed with error:', error);
          } else {
            console.log('SignalR connection closed');
          }
        });

        // Debug: Log specific events we're interested in
        this.connection.on('CurrentUsers', (...args: any[]) => {
          console.log('CurrentUsers event received:', args);
        });
        
        this.connection.on('UserConnected', (...args: any[]) => {
          console.log('UserConnected event received:', args);
        });
        
        this.connection.on('UserDisconnected', (...args: any[]) => {
          console.log('UserDisconnected event received:', args);
        });

        console.log('Starting SignalR connection...');
        
        // Add timeout to connection attempt
        const connectionPromise = this.connection.start();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
        });
        
        try {
          await Promise.race([connectionPromise, timeoutPromise]);
          console.log('SignalR Connected successfully');
          return; // Success! Exit the retry loop
        } catch (timeoutError) {
          // If it's a timeout, clean up the connection
          if (this.connection) {
            try {
              await this.connection.stop();
            } catch (stopError) {
              console.log('Error stopping connection after timeout:', stopError);
            }
            this.connection = null;
          }
          lastError = timeoutError;
          console.log(`Transport configuration ${i + 1} failed:`, timeoutError);
          continue; // Try next configuration
        }
      } catch (configError) {
        lastError = configError;
        console.log(`Transport configuration ${i + 1} failed:`, configError);
        continue; // Try next configuration
      }
    }
    
    // If we get here, all transport configurations failed
    const errorMessage = lastError?.message || lastError?.toString() || 'Unknown error';
    console.error('All transport configurations failed. Last error:', errorMessage);
    
    // Try to provide more specific error information
    if (errorMessage.includes('pathname')) {
      console.error('Pathname error detected - this is a known React Native issue');
      throw new Error('Connection failed due to React Native compatibility issue. Please check your network connection and try again.');
    } else if (errorMessage.includes('WebSocket')) {
      console.error('WebSocket connection failed');
      throw new Error('WebSocket connection failed. Please check your network connection.');
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      console.error('Authentication failed');
      throw new Error('Authentication failed. Please log in again.');
    } else if (errorMessage.includes('timeout')) {
      console.error('Connection timeout');
      throw new Error('Connection timeout. Please check your network connection and try again.');
    } else {
      throw new Error(`All connection methods failed: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    this.isConnecting = false;
    this.connectionPromise = null;
    
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR Disconnected');
      } catch (error: any) {
        console.error('Error stopping SignalR connection:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('Disconnect error details:', errorMessage);
      } finally {
        this.connection = null;
      }
    }
  }

  async sendMessage(content: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SendMessage', content);
      } catch (error: any) {
        console.error('Error sending message:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        throw new Error(`Failed to send message: ${errorMessage}`);
      }
    } else {
      throw new Error('SignalR connection is not active');
    }
  }

  async addReaction(messageId: number, emoji: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('AddReaction', messageId, emoji);
      } catch (error: any) {
        console.error('Error adding reaction:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        throw new Error(`Failed to add reaction: ${errorMessage}`);
      }
    } else {
      throw new Error('SignalR connection is not active');
    }
  }

  async removeReaction(messageId: number, emoji: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('RemoveReaction', messageId, emoji);
      } catch (error: any) {
        console.error('Error removing reaction:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        throw new Error(`Failed to remove reaction: ${errorMessage}`);
      }
    } else {
      throw new Error('SignalR connection is not active');
    }
  }

  onCurrentUsers(callback: (users: string[]) => void): void {
    if (this.connection) {
      this.connection.on('CurrentUsers', callback);
    }
  }

  async getCurrentUsers(): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('GetCurrentUsers');
        console.log('Requested current users from server');
      } catch (error: any) {
        console.error('Error requesting current users:', error);
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('GetCurrentUsers error:', errorMessage);
      }
    } else {
      console.log('Cannot request current users - connection not active');
    }
  }

  onReactionAdded(callback: (data: { messageId: number; emoji: string; username: string; userId: number }) => void): void {
    if (this.connection) {
      this.connection.on('ReactionAdded', callback);
    }
  }

  onReactionRemoved(callback: (data: { messageId: number; emoji: string; userId: number }) => void): void {
    if (this.connection) {
      this.connection.on('ReactionRemoved', callback);
    }
  }

  async sendTyping(): Promise<void> {
    // Frontend-only typing - no server call needed
    return Promise.resolve();
  }

  async stopTyping(): Promise<void> {
    // Frontend-only typing - no server call needed
    return Promise.resolve();
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  onUserConnected(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserConnected', callback);
    }
  }

  onUserDisconnected(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserDisconnected', callback);
    }
  }

  onUserTyping(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserTyping', callback);
    }
  }

  onUserStoppedTyping(callback: (username: string) => void): void {
    if (this.connection) {
      this.connection.on('UserStoppedTyping', callback);
    }
  }

  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    
    switch (this.connection.state) {
      case HubConnectionState.Connected:
        return 'Connected';
      case HubConnectionState.Connecting:
        return 'Connecting';
      case HubConnectionState.Reconnecting:
        return 'Reconnecting';
      case HubConnectionState.Disconnected:
        return 'Disconnected';
      case HubConnectionState.Disconnecting:
        return 'Disconnecting';
      default:
        return 'Unknown';
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
